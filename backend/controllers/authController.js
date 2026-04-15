const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ── Generate JWT ─────────────────────────────────────────────
const generateToken = (id, role) =>
  jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
      issuer: 'savoria-app',
      audience: 'savoria-users',
    }
  )

// ── Send token response ──────────────────────────────────────
const sendToken = (user, res, status = 200) => {
  const token = generateToken(user._id, user.role)
  const { password, ...safeUser } = user.toObject()

  res.status(status).json({
    success: true,
    token,
    user: {
      ...safeUser,
      avatar: user.initials || safeUser.avatar,
    },
  })
}

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// ─────────────────────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('All required fields must be filled')
  }

  if (!email.includes('@')) {
    res.status(400)
    throw new Error('Invalid email format')
  }

  const exists = await User.findOne({ email })
  if (exists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'user', // 🔥 FIXED (no role injection)
    phone: phone || '',
  })

  sendToken(user, res, 201)
})

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// ─────────────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  if (!user.isActive) {
    res.status(403)
    throw new Error('Account deactivated')
  }

  user.lastLogin = Date.now()
  await user.save({ validateBeforeSave: false })

  sendToken(user, res)
})

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// ─────────────────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  const { password, ...safeUser } = user.toObject()

  res.json({ success: true, user: safeUser })
})

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/auth/update-profile
// ─────────────────────────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body

  const updates = {}
  if (name) updates.name = name
  if (phone) updates.phone = phone
  if (address) updates.address = address

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true, runValidators: true }
  )

  const { password, ...safeUser } = user.toObject()
  res.json({ success: true, user: safeUser })
})

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// ─────────────────────────────────────────────────────────────
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user.id).select('+password')

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400)
    throw new Error('Current password is incorrect')
  }

  if (newPassword.length < 6) {
    res.status(400)
    throw new Error('Password must be at least 6 characters')
  }

  user.password = newPassword
  await user.save()

  sendToken(user, res)
})

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// ─────────────────────────────────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful (clear token on frontend)',
  })
})