const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Storage config
const menuStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'savoria/menu',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => `menu_${Date.now()}`,
    transformation: [
      {
        width: 600,
        height: 600,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'webp',
      },
    ],
  },
})

// Multer middleware
const uploadMenuImage = multer({
  storage: menuStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  },
})

module.exports = { cloudinary, uploadMenuImage }