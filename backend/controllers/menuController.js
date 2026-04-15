const asyncHandler = require('express-async-handler')
const MenuItem = require('../models/MenuItem')
const { cloudinary } = require('../config/cloudinary')

// ─────────────────────────────────────────────────────────────
// @route   GET /api/menu
// ─────────────────────────────────────────────────────────────
exports.getMenuItems = asyncHandler(async (req, res) => {
  const { category, search, isVeg, isBestseller, sort, page = 1, limit = 50 } =
    req.query

  const filter = { isAvailable: true }

  if (category && category !== 'All') filter.category = category
  if (isVeg !== undefined) filter.isVeg = isVeg === 'true'
  if (isBestseller === 'true') filter.isBestseller = true

  if (search) filter.$text = { $search: search }

  const sortOptions = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { 'rating.average': -1 },
    newest: { createdAt: -1 },
    default: { isBestseller: -1, 'rating.average': -1 },
  }

  const sortBy = sortOptions[sort] || sortOptions.default
  const skip = (Number(page) - 1) * Number(limit)

  const total = await MenuItem.countDocuments(filter)

  const items = await MenuItem.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(Number(limit))

  const categories = await MenuItem.distinct('category', {
    isAvailable: true,
  })

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    categories: ['All', ...categories.sort()],
    items,
  })
})

// ─────────────────────────────────────────────────────────────
// @route   GET /api/menu/:id
// ─────────────────────────────────────────────────────────────
exports.getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate(
    'createdBy',
    'name'
  )

  if (!item) {
    res.status(404)
    throw new Error('Menu item not found')
  }

  res.json({ success: true, item })
})

// ─────────────────────────────────────────────────────────────
// @route   POST /api/menu
// ─────────────────────────────────────────────────────────────
exports.createMenuItem = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    isVeg,
    isBestseller,
    prepTime,
    calories,
    tags,
  } = req.body

  // ✅ Image Handling (IMPORTANT FIX)
  let image = { url: '', publicId: '' }

  if (req.file) {
    image.url = req.file.path
    image.publicId = req.file.filename
  } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string') {
    image.url = req.body.imageUrl
  }

  const item = await MenuItem.create({
    name,
    description,
    price,
    category,
    image,
    isVeg: isVeg === 'true' || isVeg === true,
    isBestseller: isBestseller === 'true' || isBestseller === true,
    prepTime: prepTime || '15 min',
    calories: calories || 0,
    tags: Array.isArray(tags) ? tags : [],
    createdBy: req.user?.id,
  })

  res.status(201).json({ success: true, item })
})

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/menu/:id
// ─────────────────────────────────────────────────────────────
exports.updateMenuItem = asyncHandler(async (req, res) => {
  let item = await MenuItem.findById(req.params.id)

  if (!item) {
    res.status(404)
    throw new Error('Menu item not found')
  }

  const updates = { ...req.body }

  // ✅ Image Update Fix
  if (req.file) {
    if (item.image?.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId).catch(() => {})
    }

    updates.image = {
      url: req.file.path,
      publicId: req.file.filename,
    }
  } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string') {
    updates.image = {
      url: req.body.imageUrl,
      publicId: '',
    }
  }

  delete updates.createdBy
  delete updates.rating

  item = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })

  res.json({ success: true, item })
})

// ─────────────────────────────────────────────────────────────
// @route   DELETE /api/menu/:id
// ─────────────────────────────────────────────────────────────
exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id)

  if (!item) {
    res.status(404)
    throw new Error('Menu item not found')
  }

  if (item.image?.publicId) {
    await cloudinary.uploader.destroy(item.image.publicId).catch(() => {})
  }

  await item.deleteOne()

  res.json({ success: true, message: 'Menu item deleted' })
})

// ─────────────────────────────────────────────────────────────
// @route   PATCH /api/menu/:id/toggle-availability
// ─────────────────────────────────────────────────────────────
exports.toggleAvailability = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id)

  if (!item) {
    res.status(404)
    throw new Error('Menu item not found')
  }

  item.isAvailable = !item.isAvailable
  await item.save()

  res.json({ success: true, item })
})

// ─────────────────────────────────────────────────────────────
// @route   GET /api/menu/bestsellers
// ─────────────────────────────────────────────────────────────
exports.getBestsellers = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({
    isBestseller: true,
    isAvailable: true,
  })
    .sort({ 'rating.average': -1 })
    .limit(8)

  res.json({ success: true, items })
})