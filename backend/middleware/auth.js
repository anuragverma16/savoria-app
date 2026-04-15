const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ── Verify JWT token ─────────────────────────────────────────
const protect = async (req, res, next) => {
  let token

  try {
    // 🔍 Extract token (Header or Cookie)
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      })
    }

    // 🔐 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 👤 Get user
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    // 🚫 Check if account active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      })
    }

    // ✅ Attach user to request
    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalid or expired',
    })
  }
}

// ── Role-based access control ────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role '${req.user.role}'`,
      })
    }

    next()
  }
}

// ── Optional auth (safe version) ─────────────────────────────
const optionalAuth = async (req, res, next) => {
  let token

  try {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findById(decoded.id).select('-password')

      if (user && user.isActive) {
        req.user = user
      }
    }
  } catch (err) {
    // ❌ Ignore error silently (optional auth)
  }

  next()
}

module.exports = {
  protect,
  authorize,
  optionalAuth,
}