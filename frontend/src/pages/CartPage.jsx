import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowLeft, FiMapPin } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../api'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, total, count } = useCart()
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [tableNo,   setTableNo]   = useState('')
  const [orderType, setOrderType] = useState('delivery')
  const [placing,   setPlacing]   = useState(false)

  const taxes      = Math.round(total * 0.05)
  const delivery   = orderType === 'delivery' && total < 500 ? 49 : 0
  const grandTotal = total + taxes + delivery

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return }
    setPlacing(true)
    try {
      const payload = {
        items: items.map(i => ({ menuItem: i._id, qty: i.qty })),
        orderType,
        tableNo: orderType === 'dine-in' ? tableNo : '',
        paymentMethod: 'cash',
      }
      await orderAPI.create(payload)
      clearCart()
      toast.success('Order placed successfully! 🎉', {
        style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(39,174,96,0.3)' },
      })
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order', {
        style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(192,57,43,0.3)' }
      })
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-28 h-28 rounded-full glass flex items-center justify-center mx-auto mb-6 border-gold">
            <FiShoppingBag className="text-5xl text-gold-DEFAULT/40" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-white/40 mb-8 font-light">Add some delicious dishes to get started</p>
          <Link to="/menu" className="btn-gold px-8 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2">
            <FiArrowLeft /> Browse Menu
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
  
  {/* Back Button */}
  <Link
    to="/menu"
    className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-gold-DEFAULT transition-colors mb-6 group"
  >
    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
    Back to Menu
  </Link>

  {/* Title + Badge */}
  <div className="flex items-center gap-3 mb-2">
    <h1 className="font-display font-bold text-4xl text-white">
      Your <span className="text-gold-gradient">Cart</span>
    </h1>

    {/* 🔴 RED NOTIFICATION BADGE */}
    {count > 0 && (
      <span className="bg-red-500 text-white text-xs font-bold min-w-[24px] h-[24px] flex items-center justify-center rounded-full px-2 shadow-md">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </div>

  {/* Subtitle */}
  <p className="text-white/40 mb-10">
    {count === 0
      ? 'No items in cart'
      : `${count} ${count === 1 ? 'item' : 'items'}`}
  </p>

</motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-4 flex items-center gap-4"
                >
                  <img
                    src={item.image?.url || item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-white text-base mb-1 truncate">{item.name}</h3>
                    <p className="text-white/40 text-xs mb-3">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gold-DEFAULT font-bold">₹{item.price * item.qty}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 glass rounded-xl p-1">
                          <button onClick={() => updateQty(item._id, item.qty - 1)}
                            className="w-7 h-7 rounded-lg bg-red-DEFAULT/20 text-red-light hover:bg-red-DEFAULT/40 transition-colors flex items-center justify-center">
                            <FiMinus className="text-xs" />
                          </button>
                          <span className="text-white text-sm font-semibold min-w-[20px] text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item._id, item.qty + 1)}
                            className="w-7 h-7 rounded-lg bg-gold-DEFAULT/20 text-gold-DEFAULT hover:bg-gold-DEFAULT/40 transition-colors flex items-center justify-center">
                            <FiPlus className="text-xs" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item._id)}
                          className="w-8 h-8 rounded-lg text-white/30 hover:text-red-light hover:bg-red-DEFAULT/10 transition-all flex items-center justify-center">
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button onClick={clearCart} className="text-sm text-white/30 hover:text-red-light transition-colors flex items-center gap-2 mt-4">
              <FiTrash2 /> Clear all items
            </button>
          </div>

          {/* ── Order Summary ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6 h-fit sticky top-28">
            <h2 className="font-display font-semibold text-white text-xl mb-6">Order Summary</h2>

            {/* Order Type */}
            <div className="mb-5">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Order Type</label>
              <div className="grid grid-cols-3 gap-1 glass rounded-xl p-1">
                {['delivery', 'dine-in', 'takeaway'].map(t => (
                  <button key={t}
                    onClick={() => setOrderType(t)}
                    className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      orderType === t ? 'bg-red-DEFAULT text-white' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Table number (dine-in) */}
            {orderType === 'dine-in' && (
              <div className="mb-5">
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Table No.</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-DEFAULT/50 text-sm" />
                  <input
                    type="text"
                    placeholder="e.g. 7"
                    value={tableNo}
                    onChange={e => setTableNo(e.target.value)}
                    className="input-dark w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            <hr className="border-white/5 mb-5" />

            <div className="space-y-3 mb-5 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Subtotal ({count} items)</span><span>₹{total}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>GST (5%)</span><span>₹{taxes}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'text-green-400' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
              </div>
              {delivery > 0 && (
                <p className="text-xs text-white/25">Add ₹{500 - total} more for free delivery</p>
              )}
            </div>

            <hr className="border-white/5 mb-5" />
            <div className="flex justify-between items-center mb-7">
              <span className="font-semibold text-white">Total</span>
              <span className="font-display font-bold text-2xl text-gold-gradient">₹{grandTotal}</span>
            </div>

            <button
              onClick={handleOrder}
              disabled={placing}
              className="btn-gold w-full py-4 rounded-xl text-base font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {placing ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Placing Order...</>
              ) : (
                <>Place Order · ₹{grandTotal}</>
              )}
            </button>

            {!user && (
              <p className="text-center text-xs text-white/30 mt-3">
                <Link to="/login" className="text-gold-DEFAULT hover:underline">Sign in</Link> to place your order
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
