const express = require('express')
const router  = express.Router()
const {
  register, login, getMe, updateProfile, changePassword, logout,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const {
  registerRules, loginRules, validate,
} = require('../middleware/validators')

// Public
router.post('/register', registerRules, validate, register)
router.post('/login',    loginRules,    validate, login)

// Private
router.use(protect)
router.get('/me',              getMe)
router.post('/logout',         logout)
router.put('/update-profile',  updateProfile)
router.put('/change-password', changePassword)

module.exports = router
