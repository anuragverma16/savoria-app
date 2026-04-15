const express = require('express')
const router  = express.Router()

const {
  createOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus, cancelOrder, getAnalytics,
} = require('../controllers/orderController')

const { protect, authorize } = require('../middleware/auth')
const { orderRules, validate } = require('../middleware/validators')

router.use(protect)

// ── User routes ──────────────────────────────────────────────
router.post('/', authorize('user'), orderRules, validate, createOrder)
router.get('/my-orders', authorize('user'), getMyOrders)
router.patch('/:id/cancel', authorize('user'), cancelOrder)

// ── Staff + Manager routes ───────────────────────────────────
router.get('/', authorize('staff', 'manager'), getAllOrders)
router.patch('/:id/status', authorize('staff', 'manager'), updateOrderStatus)

// ── Manager only ─────────────────────────────────────────────
router.get('/analytics', authorize('manager'), getAnalytics)

// ── Any authenticated user can view a single order ───────────
router.get('/:id', getOrderById)

module.exports = router