import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiShoppingBag, FiClock, FiCheckCircle, FiTruck, FiAlertCircle, FiArrowRight, FiRefreshCw } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../api'
import { useSocket } from '../hooks/useSocket'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: FiAlertCircle, cls: 'status-pending' },
  confirmed: { label: 'Confirmed', icon: FiCheckCircle, cls: 'status-ready' },
  preparing: { label: 'Preparing', icon: FiClock,        cls: 'status-preparing' },
  ready:     { label: 'Ready',     icon: FiCheckCircle,  cls: 'status-ready' },
  delivered: { label: 'Delivered', icon: FiTruck,        cls: 'status-delivered' },
  cancelled: { label: 'Cancelled', icon: FiAlertCircle,  cls: 'status-pending' },
}

function OrderCard({ order }) {
  const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const date = new Date(order.createdAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-semibold text-white">{order.orderId}</span>
            {order.tableNo && (
              <span className="text-xs text-white/30 glass px-2 py-0.5 rounded-full">Table {order.tableNo}</span>
            )}
          </div>
          <p className="text-xs text-white/30">
            {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}
            {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ${cfg.cls}`}>
          <cfg.icon className="text-xs" /> {cfg.label}
        </span>
      </div>

      <div className="space-y-1 mb-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-white/50">
              {item.name} <span className="text-white/25">×{item.qty}</span>
            </span>
            <span className="text-white/50">₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="text-xs text-white/30 capitalize">{order.orderType} · {order.paymentMethod}</div>
        <span className="font-display font-bold text-lg text-gold-gradient">₹{order.total}</span>
      </div>
    </motion.div>
  )
}

export default function UserDashboard() {
  const { user }   = useAuth()
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await orderAPI.getMyOrders()
      setOrders(data.orders || [])
    } catch (err) {
      toast.error('Failed to load orders', {
        style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(192,57,43,0.3)' }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  // Socket: update order status in real-time
  useSocket(user, (update) => {
    setOrders(prev =>
      prev.map(o => (o._id === update._id || o.orderId === update.orderId)
        ? { ...o, status: update.status }
        : o
      )
    )
  })

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const totalSpent  = orders.reduce((s, o) => s + o.total, 0)
  const delivered   = orders.filter(o => o.status === 'delivered').length
  const active      = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-DEFAULT to-red-dark flex items-center justify-center text-xl font-bold text-white">
              {user?.avatar || user?.name?.[0]}
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl text-white">My Dashboard</h1>
              <p className="text-white/40 text-sm">Welcome back, {user?.name}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Orders', value: orders.length,        icon: FiShoppingBag },
            { label: 'Delivered',    value: delivered,             icon: FiCheckCircle },
            { label: 'Total Spent',  value: `₹${totalSpent.toLocaleString()}`, icon: FiTruck },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card text-center"
            >
              <s.icon className="text-gold-DEFAULT text-2xl mx-auto mb-2" />
              <p className="font-display font-bold text-2xl text-white">{s.value}</p>
              <p className="text-white/30 text-xs mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Active orders alert */}
        {active > 0 && (
          <div className="mb-6 glass rounded-xl px-4 py-3 border border-gold-DEFAULT/20 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-gold-DEFAULT animate-pulse flex-shrink-0" />
            <p className="text-gold-DEFAULT text-sm font-medium">
              {active} active order{active > 1 ? 's' : ''} in progress — updates will appear in real-time
            </p>
          </div>
        )}

        {/* Orders Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-xl text-white">Order History</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="p-2 rounded-lg glass-light text-white/40 hover:text-gold-DEFAULT transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/menu" className="btn-gold px-5 py-2 rounded-full text-sm flex items-center gap-2 group">
              Order Again <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`category-pill px-4 py-1.5 rounded-full text-xs font-medium border capitalize ${
                filter === f ? 'active' : 'glass-light border-white/10 text-white/40'
              }`}
            >
              {f === 'all' ? 'All Orders' : f}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-gold-DEFAULT border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FiShoppingBag className="text-5xl text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-display text-xl mb-2">No orders found</p>
            <p className="text-white/20 text-sm mb-6">Start your culinary journey today</p>
            <Link to="/menu" className="btn-gold px-6 py-2.5 rounded-full text-sm">Browse Menu</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(order => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  )
}
