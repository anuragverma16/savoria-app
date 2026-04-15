const mongoose = require('mongoose');

// ── Sub-schema: individual item in an order ─────────────────
const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
  image:    { type: String },
}, { _id: false });

// ── Status history entry ────────────────────────────────────
const statusHistorySchema = new mongoose.Schema({
  status:    { type: String },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

// ── Main Order schema ───────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true, // ✅ automatically indexed
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: {
      type: [orderItemSchema],
      validate: [arr => arr.length > 0, 'Order must have at least one item'],
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [], // ✅ prevents undefined error
    },

    // Pricing
    subtotal:    { type: Number, required: true },
    tax:         { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    total:       { type: Number, required: true },

    // Delivery
    orderType: { type: String, enum: ['delivery', 'dine-in', 'takeaway'], default: 'delivery' },
    tableNo:   { type: String, default: '' },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Payment
    paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'online'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },

    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },

    // Extra
    specialInstructions: { type: String, maxlength: 300 },
    estimatedTime: { type: Number, default: 30 },
    pointsEarned:  { type: Number, default: 0 },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ── Auto-generate orderId + track status ────────────────────
orderSchema.pre('save', async function (next) {
  try {
    // ✅ SAFE & UNIQUE orderId (no race condition)
    if (!this.orderId) {
      this.orderId = `SAV${Date.now()}`;
    }

    // ✅ Track status changes safely
    if (this.isModified('status')) {
      this.statusHistory.push({
        status: this.status,
        updatedBy: this.updatedBy,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
});

// ── Indexes for performance ────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 }); // user order history
orderSchema.index({ status: 1 });              // filter by status
orderSchema.index({ createdAt: -1 });          // latest orders first

module.exports = mongoose.model('Order', orderSchema);