require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const connectDB = require('../config/db')

const User     = require('../models/User')
const MenuItem = require('../models/MenuItem')
const Order    = require('../models/Order')

// ─── Seed Data ────────────────────────────────────────────────
const users = [
  { name: 'Rahul Kapoor',  email: 'manager@savoria.com', password: 'manager123', role: 'manager', phone: '+91 76543 21098' },
  { name: 'Priya Mehta',   email: 'staff@savoria.com',   password: 'staff123',   role: 'staff',   phone: '+91 87654 32109' },
  { name: 'Arjun Sharma',  email: 'user@savoria.com',    password: 'user123',    role: 'user',    phone: '+91 98765 43210' },
  { name: 'Kavita Reddy',  email: 'user2@savoria.com',   password: 'user123',    role: 'user',    phone: '+91 91234 56789' },
]

const menuItems = [
  // ── Starters ──────────────────────────────────────────────
  {
    name: 'Tandoori Prawns', category: 'Starters', price: 649,
    description: 'Succulent tiger prawns marinated in classic tandoori spices, chargrilled to perfection with mint chutney.',
    image: { url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80' },
    isVeg: false, isBestseller: true, prepTime: '15 min', calories: 280,
    rating: { average: 4.8, count: 142 }, tags: ['spicy', 'grilled', 'seafood'],
  },
  {
    name: 'Paneer Tikka', category: 'Starters', price: 449,
    description: 'Cottage cheese cubes marinated in aromatic yogurt spices, grilled in tandoor. A vegetarian classic.',
    image: { url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
    isVeg: true, isBestseller: true, prepTime: '12 min', calories: 320,
    rating: { average: 4.7, count: 198 }, tags: ['vegetarian', 'grilled'],
  },
  {
    name: 'Chicken Seekh Kebab', category: 'Starters', price: 549,
    description: 'Minced chicken with herbs and spices, skewered and cooked in traditional charcoal tandoor.',
    image: { url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80' },
    isVeg: false, isBestseller: false, prepTime: '18 min', calories: 310,
    rating: { average: 4.6, count: 87 }, tags: ['grilled', 'chicken'],
  },
  {
    name: 'Hara Bhara Kebab', category: 'Starters', price: 349,
    description: 'Crispy patties made with spinach, peas, and spices. Served with house mint chutney.',
    image: { url: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&q=80' },
    isVeg: true, isBestseller: false, prepTime: '10 min', calories: 210,
    rating: { average: 4.4, count: 63 }, tags: ['vegetarian', 'healthy'],
  },
  // ── Main Course ───────────────────────────────────────────
  {
    name: 'Butter Chicken', category: 'Main Course', price: 599,
    description: 'Tender chicken in a velvety tomato-butter sauce with aromatic spices. The iconic Mughlai classic.',
    image: { url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80' },
    isVeg: false, isBestseller: true, prepTime: '20 min', calories: 480,
    rating: { average: 4.9, count: 312 }, tags: ['mughlai', 'chicken', 'rich'],
  },
  {
    name: 'Dal Makhani', category: 'Main Course', price: 399,
    description: 'Slow-cooked black lentils in a rich buttery tomato gravy, simmered overnight for deep flavour.',
    image: { url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80' },
    isVeg: true, isBestseller: true, prepTime: '15 min', calories: 380,
    rating: { average: 4.8, count: 276 }, tags: ['vegetarian', 'lentils', 'rich'],
  },
  {
    name: 'Lamb Rogan Josh', category: 'Main Course', price: 799,
    description: 'Tender slow-braised lamb in Kashmiri spices with aromatic whole spices and yogurt gravy.',
    image: { url: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=600&q=80' },
    isVeg: false, isBestseller: false, prepTime: '25 min', calories: 550,
    rating: { average: 4.7, count: 94 }, tags: ['kashmiri', 'lamb'],
  },
  {
    name: 'Palak Paneer', category: 'Main Course', price: 449,
    description: 'Fresh cottage cheese in a vibrant spinach sauce, spiced with ginger, garlic and cumin.',
    image: { url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' },
    isVeg: true, isBestseller: false, prepTime: '15 min', calories: 340,
    rating: { average: 4.5, count: 108 }, tags: ['vegetarian', 'healthy', 'spinach'],
  },
  {
    name: 'Chicken Tikka Masala', category: 'Main Course', price: 649,
    description: 'Chargrilled chicken tikka in a rich, creamy tomato masala. A global favourite with Indian roots.',
    image: { url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80' },
    isVeg: false, isBestseller: true, prepTime: '20 min', calories: 510,
    rating: { average: 4.8, count: 245 }, tags: ['chicken', 'creamy', 'spicy'],
  },
  // ── Biryani ───────────────────────────────────────────────
  {
    name: 'Hyderabadi Dum Biryani', category: 'Biryani', price: 699,
    description: 'Aromatic basmati rice slow-cooked with tender chicken in a sealed pot, layered with caramelized onions.',
    image: { url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&q=80' },
    isVeg: false, isBestseller: true, prepTime: '35 min', calories: 620,
    rating: { average: 4.9, count: 389 }, tags: ['biryani', 'rice', 'chicken'],
  },
  {
    name: 'Veg Dum Biryani', category: 'Biryani', price: 549,
    description: 'Seasonal vegetables and paneer slow-cooked with fragrant basmati rice and exotic spices.',
    image: { url: 'https://images.unsplash.com/photo-1606491956391-9f982af2e83c?w=600&q=80' },
    isVeg: true, isBestseller: false, prepTime: '30 min', calories: 520,
    rating: { average: 4.6, count: 132 }, tags: ['vegetarian', 'biryani', 'rice'],
  },
  {
    name: 'Prawn Biryani', category: 'Biryani', price: 849,
    description: 'Tiger prawns marinated in coastal spices, layered with saffron basmati rice and crispy onions.',
    image: { url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80' },
    isVeg: false, isBestseller: false, prepTime: '35 min', calories: 580,
    rating: { average: 4.8, count: 76 }, tags: ['seafood', 'biryani', 'rice'],
  },
  // ── Breads ────────────────────────────────────────────────
  {
    name: 'Garlic Naan', category: 'Breads', price: 129,
    description: 'Soft leavened bread baked in tandoor, brushed with garlic butter and fresh coriander.',
    image: { url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80' },
    isVeg: true, isBestseller: true, prepTime: '8 min', calories: 180,
    rating: { average: 4.7, count: 421 }, tags: ['bread', 'garlic'],
  },
  {
    name: 'Laccha Paratha', category: 'Breads', price: 99,
    description: 'Flaky whole wheat layered flatbread with a golden crispy exterior and soft interior.',
    image: { url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80' },
    isVeg: true, isBestseller: false, prepTime: '6 min', calories: 160,
    rating: { average: 4.5, count: 187 }, tags: ['bread', 'wheat'],
  },
  {
    name: 'Butter Naan', category: 'Breads', price: 109,
    description: 'Classic tandoor-baked leavened bread finished with a generous spread of creamy butter.',
    image: { url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80' },
    isVeg: true, isBestseller: false, prepTime: '8 min', calories: 195,
    rating: { average: 4.6, count: 203 }, tags: ['bread', 'butter'],
  },
  // ── Desserts ──────────────────────────────────────────────
  {
    name: 'Gulab Jamun', category: 'Desserts', price: 199,
    description: 'Soft milk-solid dumplings soaked in rose-infused sugar syrup. Served warm with vanilla ice cream.',
    image: { url: 'https://images.unsplash.com/photo-1666195547989-66d40a4a7b2c?w=600&q=80' },
    isVeg: true, isBestseller: true, prepTime: '5 min', calories: 290,
    rating: { average: 4.8, count: 334 }, tags: ['sweet', 'traditional'],
  },
  {
    name: 'Mango Kulfi', category: 'Desserts', price: 249,
    description: 'Traditional slow-churned Indian ice cream with Alphonso mango, cardamom and pistachio.',
    image: { url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80' },
    isVeg: true, isBestseller: false, prepTime: '3 min', calories: 220,
    rating: { average: 4.7, count: 156 }, tags: ['ice cream', 'mango', 'frozen'],
  },
  {
    name: 'Rasgulla', category: 'Desserts', price: 179,
    description: 'Spongy cottage cheese dumplings cooked in light sugar syrup — a Bengali delicacy.',
    image: { url: 'https://images.unsplash.com/photo-1620284922642-5180e13ab7ba?w=600&q=80' },
    isVeg: true, isBestseller: false, prepTime: '5 min', calories: 240,
    rating: { average: 4.5, count: 89 }, tags: ['sweet', 'bengali', 'traditional'],
  },
  // ── Drinks ────────────────────────────────────────────────
  {
    name: 'Mango Lassi', category: 'Drinks', price: 189,
    description: 'Thick creamy yogurt blended with ripe Alphonso mangoes and a hint of cardamom.',
    image: { url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&q=80' },
    isVeg: true, isBestseller: true, prepTime: '5 min', calories: 230,
    rating: { average: 4.8, count: 278 }, tags: ['drink', 'mango', 'yogurt'],
  },
  {
    name: 'Rose Sharbat', category: 'Drinks', price: 149,
    description: 'Refreshing chilled rose syrup with basil seeds and a hint of lemon. Perfect palate cleanser.',
    image: { url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80' },
    isVeg: true, isBestseller: false, prepTime: '3 min', calories: 120,
    rating: { average: 4.5, count: 94 }, tags: ['drink', 'rose', 'refreshing'],
  },
  {
    name: 'Masala Chai', category: 'Drinks', price: 99,
    description: 'Aromatic spiced Indian tea brewed with ginger, cardamom, cinnamon and fresh milk.',
    image: { url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80' },
    isVeg: true, isBestseller: false, prepTime: '5 min', calories: 80,
    rating: { average: 4.6, count: 312 }, tags: ['tea', 'spiced', 'hot'],
  },
]

// ─── Run Seeder ───────────────────────────────────────────────
const seedDB = async () => {
  try {
    await connectDB()
    console.log('🌱 Starting database seed...')

    // Clear existing data
    await User.deleteMany()
    await MenuItem.deleteMany()
    await Order.deleteMany()
    console.log('🗑️  Cleared existing data')

    // Create users (passwords auto-hashed by pre-save hook)
    const createdUsers = await User.create(users)
    console.log(`👥  Created ${createdUsers.length} users`)

    const managerId = createdUsers[0]._id

    // Create menu items
    const itemsWithCreator = menuItems.map(item => ({ ...item, createdBy: managerId }))
    const createdItems = await MenuItem.create(itemsWithCreator)
    console.log(`🍽️   Created ${createdItems.length} menu items`)

    // Create sample orders
    const userId = createdUsers[2]._id
    const sampleOrders = [
      {
        user: userId,
        items: [
          { menuItem: createdItems[4]._id, name: createdItems[4].name, price: createdItems[4].price, qty: 2, image: createdItems[4].image.url },
          { menuItem: createdItems[12]._id, name: createdItems[12].name, price: createdItems[12].price, qty: 4, image: createdItems[12].image.url },
        ],
        subtotal: 1714, tax: 86, deliveryFee: 0, total: 1800,
        orderType: 'dine-in', tableNo: '5', status: 'delivered',
        paymentMethod: 'upi', paymentStatus: 'paid',
        pointsEarned: 180, updatedBy: managerId,
      },
      {
        user: userId,
        items: [
          { menuItem: createdItems[9]._id, name: createdItems[9].name, price: createdItems[9].price, qty: 1, image: createdItems[9].image.url },
          { menuItem: createdItems[18]._id, name: createdItems[18].name, price: createdItems[18].price, qty: 2, image: createdItems[18].image.url },
        ],
        subtotal: 1077, tax: 54, deliveryFee: 0, total: 1131,
        orderType: 'delivery', status: 'delivered',
        paymentMethod: 'cash', paymentStatus: 'paid',
        pointsEarned: 113, updatedBy: managerId,
      },
    ]
    await Order.create(sampleOrders)
    console.log(`📦  Created ${sampleOrders.length} sample orders`)

    console.log('\n✅  Database seeded successfully!')
    console.log('\n🔑  Login Credentials:')
    console.log('   Manager → manager@savoria.com / manager123')
    console.log('   Staff   → staff@savoria.com   / staff123')
    console.log('   User    → user@savoria.com     / user123')
    process.exit(0)
  } catch (err) {
    console.error('❌  Seeder error:', err)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) seedDB()
module.exports = seedDB
