// ── Load environment variables first ────────────────────────
require('dotenv').config()

const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')

const connectDB = require('./config/db')
// ── Route imports ────────────────────────────────────────────
const authRoutes   = require('./routes/authRoutes')
const menuRoutes   = require('./routes/menuRoutes')
const orderRoutes  = require('./routes/orderRoutes')
const userRoutes   = require('./routes/userRoutes')
const reviewRoutes = require('./routes/reviewRoutes')

// ── Error middleware ─────────────────────────────────────────
const { errorHandler, notFound } = require('./middleware/error')

// ── Connect to MongoDB ───────────────────────────────────────
connectDB()

// ── App setup ────────────────────────────────────────────────
const app    = express()
const server = http.createServer(app)

// ── Socket.io setup ──────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})



// Make io available in controllers via req.app.get('io')
app.set('io', io)

io.on('connection', (socket) => {
  console.log(`🔌  Socket connected: ${socket.id}`)

  // Join user-specific room for targeted notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`)
    console.log(`👤  User ${userId} joined their room`)
  })

  // Staff/manager joins kitchen room
  socket.on('join-kitchen', () => {
    socket.join('kitchen')
    console.log(`👨‍🍳  Client joined kitchen room`)
  })

  socket.on('disconnect', () => {
    console.log(`🔌  Socket disconnected: ${socket.id}`)
  })
})

// ── Security & utilities middleware ──────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ── Rate limiting ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  message:  { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: 'Too many auth attempts, please try again later.' },
})

app.use('/api', globalLimiter)
app.use('/api/auth', authLimiter)

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🍽️  Savoria API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ── API routes ────────────────────────────────────────────────
app.use('/api/auth',    authRoutes)
app.use('/api/menu',    menuRoutes)
app.use('/api/orders',  orderRoutes)
app.use('/api/users',   userRoutes)
app.use('/api/reviews', reviewRoutes)

// ── 404 & Error handlers ──────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log('\n')
  console.log('╔═══════════════════════════════════════╗')
  console.log('║       🍽️  SAVORIA RESTAURANT API       ║')
  console.log('╠═══════════════════════════════════════╣')
  console.log(`║  Server  → http://localhost:${PORT}       ║`)
  console.log(`║  Mode    → ${process.env.NODE_ENV || 'development'}                ║`)
  console.log('╚═══════════════════════════════════════╝')
  console.log('\n📌  Routes available:')
  console.log('   POST /api/auth/register')
  console.log('   POST /api/auth/login')
  console.log('   GET  /api/menu')
  console.log('   POST /api/orders')
  console.log('   GET  /api/orders/analytics')
  console.log('   GET  /api/health\n')
})

// ── Unhandled rejections ──────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('❌  Unhandled Rejection:', err.message)
  server.close(() => process.exit(1))
})

process.on('uncaughtException', (err) => {
  console.error('❌  Uncaught Exception:', err.message)
  process.exit(1)
})

module.exports = { app, server, io }
