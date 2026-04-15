const asyncHandler = require('express-async-handler')
const Review   = require('../models/Review')
const Order    = require('../models/Order')
const MenuItem = require('../models/MenuItem')

// ─────────────────────────────────────────────────────────────
// @route   POST /api/reviews
// @access  Private (user)
// ─────────────────────────────────────────────────────────────
exports.createReview = asyncHandler(async (req, res) => {
  const { menuItem: menuItemId, rating, comment, order: orderId } = req.body

  // Check menu item exists
  const menuItem = await MenuItem.findById(menuItemId)
  if (!menuItem) { res.status(404); throw new Error('Menu item not found') }

  // Optional: verify user actually ordered this item
  if (orderId) {
    const order = await Order.findOne({ _id: orderId, user: req.user.id, status: 'delivered' })
    if (!order) { res.status(400); throw new Error('You can only review items from your delivered orders') }
  }

  // Check duplicate
  const existing = await Review.findOne({ user: req.user.id, menuItem: menuItemId })
  if (existing) { res.status(400); throw new Error('You have already reviewed this item') }

  const review = await Review.create({
    user: req.user.id, menuItem: menuItemId,
    order: orderId || undefined,
    rating, comment,
  })

  res.status(201).json({ success: true, review })
})

// ─────────────────────────────────────────────────────────────
// @route   GET /api/reviews/menu/:menuItemId
// @access  Public
// ─────────────────────────────────────────────────────────────
exports.getMenuItemReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ menuItem: req.params.menuItemId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20)

  res.json({ success: true, reviews })
})

// ─────────────────────────────────────────────────────────────
// @route   DELETE /api/reviews/:id
// @access  Private (user - own review, or manager)
// ─────────────────────────────────────────────────────────────
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) { res.status(404); throw new Error('Review not found') }

  if (req.user.role !== 'manager' && review.user.toString() !== req.user.id) {
    res.status(403); throw new Error('Not authorised to delete this review')
  }

  await review.remove()
  res.json({ success: true, message: 'Review deleted' })
})
