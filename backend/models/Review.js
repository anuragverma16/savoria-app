const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    order:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, maxlength: 400 },
  },
  { timestamps: true }
)

// One review per user per menu item
reviewSchema.index({ user: 1, menuItem: 1 }, { unique: true })

// ── Update MenuItem rating average after save ───────────────
reviewSchema.statics.calcAverageRating = async function (menuItemId) {
  const stats = await this.aggregate([
    { $match: { menuItem: menuItemId } },
    { $group: { _id: '$menuItem', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const MenuItem = require('./MenuItem')
  if (stats.length > 0) {
    await MenuItem.findByIdAndUpdate(menuItemId, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count':   stats[0].count,
    })
  } else {
    await MenuItem.findByIdAndUpdate(menuItemId, { 'rating.average': 0, 'rating.count': 0 })
  }
}

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.menuItem)
})

reviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.menuItem)
})

module.exports = mongoose.model('Review', reviewSchema)
