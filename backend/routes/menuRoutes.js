const express = require('express')
const router  = express.Router()

const {
  getMenuItems, getMenuItem, createMenuItem, updateMenuItem,
  deleteMenuItem, toggleAvailability, getBestsellers,
} = require('../controllers/menuController')

const { protect, authorize }          = require('../middleware/auth')
const { menuItemRules, validate }     = require('../middleware/validators')
const { uploadMenuImage }             = require('../config/cloudinary')

// ── Public routes ────────────────────────────────────────────
router.get('/',            getMenuItems)
router.get('/bestsellers', getBestsellers)
router.get('/:id',         getMenuItem)

// ── Protected routes (manager only) ─────────────────────────
router.use(protect)
router.use(authorize('manager'))

router.post(
  '/',
  uploadMenuImage.single('image'),
  menuItemRules,
  validate,
  createMenuItem
)

router.put(
  '/:id',
  uploadMenuImage.single('image'),
  validate,
  updateMenuItem
)

router.delete('/:id', deleteMenuItem)

router.patch(
  '/:id/toggle-availability',
  authorize('manager', 'staff'),
  toggleAvailability
)

module.exports = router
