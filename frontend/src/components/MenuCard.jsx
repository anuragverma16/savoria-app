import { motion } from 'framer-motion'
import { FiPlus, FiMinus, FiShoppingCart, FiClock } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function MenuCard({ item, index = 0 }) {
  const { items, addItem, updateQty, removeItem } = useCart()

  const cartItem = items.find(i => i._id === item._id)
  const qty = cartItem?.qty || 0

  const handleAdd = () => {
    addItem(item)
    toast.success(`${item.name} added to cart`, {
      style: {
        background: '#1a1a1a',
        color: '#f5f5f0',
        border: '1px solid rgba(212,175,55,0.2)',
      },
      iconTheme: {
        primary: '#d4af37',
        secondary: '#0a0a0a',
      },
    })
  }

  // ✅ ONLY use backend image (NO RANDOM IMAGE)
  const imageUrl = item.image?.url || item.imageUrl || ''

  const rating = item.rating?.average || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="menu-card glass rounded-2xl overflow-hidden group relative"
    >
      {/* Bestseller */}
      {item.isBestseller && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-gold-dark to-gold-DEFAULT text-black text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          ★ Bestseller
        </div>
      )}

      {/* Veg / Non-Veg */}
      <div className={`absolute top-3 right-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center ${
        item.isVeg ? 'border-green-500 bg-green-500/10' : 'border-red-light bg-red-light/10'
      }`}>
        <span className={`w-2.5 h-2.5 rounded-full ${
          item.isVeg ? 'bg-green-500' : 'bg-red-light'
        }`} />
      </div>

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-black flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null
              e.target.style.display = 'none' // ❌ hide broken image
            }}
          />
        ) : (
          <span className="text-white/20 text-xs">No Image</span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Prep Time */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/80 text-xs glass px-2 py-1 rounded-full">
          <FiClock className="text-gold-DEFAULT" />
          {item.prepTime}
        </div>

        {/* Calories */}
        <div className="absolute bottom-3 right-3 text-white/80 text-xs glass px-2 py-1 rounded-full">
          {item.calories} kcal
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-white font-semibold">{item.name}</h3>
          <div className="flex items-center gap-1">
            <FaStar className="text-gold-DEFAULT text-xs" />
            <span className="text-gold-DEFAULT text-xs">{rating}</span>
          </div>
        </div>

        <p className="text-xs text-gold-DEFAULT/70 uppercase">{item.category}</p>

        <p className="text-white/40 text-xs mt-2 mb-4 line-clamp-2">
          {item.description}
        </p>

        {/* Bottom */}
        <div className="flex justify-between items-center">
          <span className="text-gold-gradient font-bold text-lg">
            ₹{item.price}
          </span>

          {/* Cart Controls */}
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              className="btn-gold px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <FiShoppingCart />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2 glass p-1 rounded-xl">
              <button
                onClick={() => {
                  if (qty <= 1) removeItem(item._id)
                  else updateQty(item._id, qty - 1)
                }}
                className="w-7 h-7 bg-red-DEFAULT/20 rounded flex items-center justify-center"
              >
                <FiMinus />
              </button>

              <span>{qty}</span>

              <button
                onClick={() => updateQty(item._id, qty + 1)}
                className="w-7 h-7 bg-gold-DEFAULT/20 rounded flex items-center justify-center"
              >
                <FiPlus />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}