const express = require('express')
const router  = express.Router()

const {
  createReview, getMenuItemReviews, deleteReview,
} = require('../controllers/reviewController')

const { protect, authorize } = require('../middleware/auth')
const { reviewRules, validate } = require('../middleware/validators')

// Public
router.get('/menu/:menuItemId', getMenuItemReviews)

// Private
router.use(protect)
router.post('/', reviewRules, validate, createReview)
router.delete('/:id', deleteReview)

module.exports = router
