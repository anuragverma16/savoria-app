const asyncHandler = require('express-async-handler')
const Order        = require('../models/Order')
const MenuItem     = require('../models/MenuItem')
const User         = require('../models/User')

// ─────────────────────────────────────────────────────────────
// @route   POST /api/orders
// @access  Private (user)
// ─────────────────────────────────────────────────────────────
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, orderType, tableNo, address, paymentMethod, specialInstructions } = req.body

  // Validate all items exist and are available
  const orderItems = []
  let subtotal = 0

  for (const reqItem of items) {
    const menuItem = await MenuItem.findById(reqItem.menuItem)
    if (!menuItem) {
      res.status(404); throw new Error(`Menu item not found: ${reqItem.menuItem}`)
    }
    if (!menuItem.isAvailable) {
      res.status(400); throw new Error(`${menuItem.name} is currently not available`)
    }
    const qty   = Number(reqItem.qty)
    const price = menuItem.price
    subtotal += price * qty
    orderItems.push({
      menuItem: menuItem._id,
      name:     menuItem.name,
      price,
      qty,
      image:    menuItem.image?.url || '',
    })
  }

  const tax         = Math.round(subtotal * 0.05)
  const deliveryFee = orderType === 'delivery' && subtotal < 500 ? 49 : 0
  const total       = subtotal + tax + deliveryFee

  const order = await Order.create({
    user:     req.user.id,
    items:    orderItems,
    orderType: orderType || 'delivery',
    tableNo:  tableNo || '',
    address,
    paymentMethod: paymentMethod || 'cash',
    specialInstructions,
    subtotal, tax, deliveryFee, total,
    status:   'pending',
    estimatedTime: orderType === 'dine-in' ? 20 : 35,
    pointsEarned: Math.floor(total / 10),
    updatedBy: req.user.id,
  })

  // Award loyalty points
  await User.findByIdAndUpdate(req.user.id, { $inc: { loyaltyPoints: Math.floor(total / 10) } })

  // Emit socket event for real-time update
  if (req.app.get('io')) {
    req.app.get('io').emit('new-order', { orderId: order.orderId, total, status: 'pending' })
  }

  // Populate and return
  const populated = await Order.findById(order._id).populate('user', 'name email phone')
  res.status(201).json({ success: true, order: populated })
})

// ─────────────────────────────────────────────────────────────
// @route   GET /api/orders/my-orders
// @access  Private (user)
// ─────────────────────────────────────────────────────────────
exports.getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const filter = { user: req.user.id }
  if (status && status !== 'all') filter.status = status

  const total  = await Order.countDocuments(filter)
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))

  res.json({ success: true, total, orders })
})

// ─────────────────────────────────────────────────────────────
// @route   GET /api/orders/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone')

  if (!order) { res.status(404); throw new Error('Order not found') }

  // Users can only see their own orders; staff/manager see all
  if (req.user.role === 'user' && order.user._id.toString() !== req.user.id) {
    res.status(403); throw new Error('Not authorised to view this order')
  }

  res.json({ success: true, order })
})

// ─────────────────────────────────────────────────────────────
// @route   GET /api/orders (all orders)
// @access  Private (staff, manager)
// ─────────────────────────────────────────────────────────────
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, date } = req.query
  const filter = {}

  if (status && status !== 'all') filter.status = status
  if (date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0)
    const end   = new Date(date); end.setHours(23, 59, 59, 999)
    filter.createdAt = { $gte: start, $lte: end }
  }

  const total  = await Order.countDocuments(filter)
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email phone')

  res.json({ success: true, total, pages: Math.ceil(total / limit), orders })
})

// ─────────────────────────────────────────────────────────────
// @route   PATCH /api/orders/:id/status
// @access  Private (staff, manager)
// ─────────────────────────────────────────────────────────────
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const VALID = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

  if (!VALID.includes(status)) {
    res.status(400); throw new Error(`Invalid status. Must be one of: ${VALID.join(', ')}`)
  }

  const order = await Order.findById(req.params.id)
  if (!order) { res.status(404); throw new Error('Order not found') }

  order.status    = status
  order.updatedBy = req.user.id
  if (status === 'delivered') order.paymentStatus = 'paid'
  await order.save()

  // Real-time update via Socket.io
  if (req.app.get('io')) {
    req.app.get('io').emit('order-status-updated', {
      orderId: order.orderId, _id: order._id, status,
    })
    // Notify the specific user
    req.app.get('io').to(`user_${order.user}`).emit('my-order-updated', { orderId: order.orderId, status })
  }

  res.json({ success: true, order })
})

// ─────────────────────────────────────────────────────────────
// @route   PATCH /api/orders/:id/cancel
// @access  Private (user - own orders only, or manager)
// ─────────────────────────────────────────────────────────────
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) { res.status(404); throw new Error('Order not found') }

  // Users can only cancel their own orders
  if (req.user.role === 'user' && order.user.toString() !== req.user.id) {
    res.status(403); throw new Error('Not authorised')
  }

  if (['delivered', 'cancelled'].includes(order.status)) {
    res.status(400); throw new Error(`Cannot cancel an order that is already ${order.status}`)
  }

  order.status    = 'cancelled'
  order.updatedBy = req.user.id
  await order.save()

  // Reverse loyalty points
  await User.findByIdAndUpdate(order.user, { $inc: { loyaltyPoints: -order.pointsEarned } })

  res.json({ success: true, message: 'Order cancelled', order })
})

// ─────────────────────────────────────────────────────────────
// @route   GET /api/orders/analytics
// @access  Private (manager)
// ─────────────────────────────────────────────────────────────
exports.getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query
  const days  = Number(period)
  const since = new Date(); since.setDate(since.getDate() - days)

  const [totalRevenue, totalOrders, statusBreakdown, topItems, dailyRevenue] = await Promise.all([
    // Total revenue (delivered orders)
    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),

    // Total orders count
    Order.countDocuments({ createdAt: { $gte: since } }),

    // Orders by status
    Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Top selling menu items
    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: since } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalQty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]),

    // Daily revenue for chart
    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: since } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders:  { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]),
  ])

  const revenue = totalRevenue[0]?.total || 0
  const avgOrderValue = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0

  res.json({
    success: true,
    analytics: {
      revenue, totalOrders, avgOrderValue,
      statusBreakdown: statusBreakdown.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      topItems,
      dailyRevenue,
    },
  })
})
