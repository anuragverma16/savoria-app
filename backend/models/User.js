const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: [true, 'Name is required'], trim: true, maxlength: [60, 'Name cannot exceed 60 chars'],
    },
    email: {
      type: String, required: [true, 'Email is required'], unique: true,
      lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String, enum: ['user', 'staff', 'manager'], default: 'user',
    },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // Address for delivery
    address: {
      street: String, city: String, state: String, pincode: String,
    },
    // Loyalty points
    loyaltyPoints: { type: Number, default: 0 },
    lastLogin: { type: Date },
  },
  { timestamps: true }
)

// ── Hash password before save ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  // Auto-generate avatar initials
  if (!this.avatar) {
    this.avatar = this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  next()
})

// ── Compare password method ─────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

// ── Virtual: full name initials ─────────────────────────────
userSchema.virtual('initials').get(function () {
  return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

module.exports = mongoose.model('User', userSchema)
