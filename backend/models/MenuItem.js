const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description too long'],
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be greater than 0'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Starters',
        'Main Course',
        'Biryani',
        'Breads',
        'Desserts',
        'Drinks',
        'Specials',
      ],
    },

    // ✅ Fixed Image Handling
    image: {
      url: {
        type: String,
        default: '', // ❌ removed hardcoded URL (handle in frontend)
      },
      publicId: {
        type: String,
        default: '',
      },
    },

    isVeg: {
      type: Boolean,
      default: true,
    },

    isBestseller: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    prepTime: {
      type: String,
      default: '15 min',
    },

    calories: {
      type: Number,
      default: 0,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

/* ===========================
   ✅ Virtual Fields
=========================== */

// Easier rating access
menuItemSchema.virtual('ratingScore').get(function () {
  return this.rating?.average || 0
})

// ✅ Image fallback (VERY IMPORTANT FIX)
menuItemSchema.virtual('imageUrl').get(function () {
  return (
    this.image?.url ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
  )
})

/* ===========================
   ✅ Indexing (Search Optimization)
=========================== */

menuItemSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
})

/* ===========================
   ✅ Middleware (Optional but useful)
=========================== */

// Trim name before save
menuItemSchema.pre('save', function (next) {
  if (this.name) this.name = this.name.trim()
  next()
})

/* ===========================
   ✅ Export Model
=========================== */

module.exports = mongoose.model('MenuItem', menuItemSchema)