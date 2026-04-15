import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiCheckCircle, FiTruck, FiAlertCircle, FiRefreshCw, FiUser } from 'react-icons/fi'
import { GiChefToque } from 'react-icons/gi'
import { orderAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import toast from 'react-hot-toast'

const STATUS_FLOW   = ['pending', 'preparing', 'ready', 'delivered']
const STATUS_CONFIG = {
  pending:   { label: 'New Orders',      icon: FiAlertCircle, next: 'preparing', nextLabel: 'Start Preparing', color: '#e74c3c' },
  preparing: { label: 'Preparing',       icon: FiClock,        next: 'ready',     nextLabel: 'Mark Ready',      color: '#d4af37' },
  ready:     { label: 'Ready to Serve',  icon: FiCheckCircle,  next: 'delivered', nextLabel: 'Mark Delivered',  color: '#27ae60' },
  delivered: { label: 'Delivered',       icon: FiTruck,        next: null,        nextLabel: null,              color: '#3498db' },
}
const STATUS_CLS = {
  pending: 'status-pending', preparing: 'status-preparing', ready: 'status-ready', delivered: 'status-delivered',
}

function OrderTicket({ order, onUpdateStatus }) {
  const cfg     = STATUS_CONFIG[order.status]
  const date    = new Date(order.createdAt)
  const elapsed = Math.floor((Date.now() - date.getTime()) / 60000)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass rounded-xl p-4 mb-3"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-display font-semibold text-white text-sm">{order.orderId}</p>
          <div className="flex items-center gap-1 text-white/30 text-xs mt-0.5">
            <FiUser className="text-xs" /> {order.user?.name || 'Guest'}
            {order.tableNo && <span className="ml-1 text-gold-DEFAULT/50">· Table {order.tableNo}</span>}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[order.status]}`}>
            {order.status}
          </span>
          <p className="text-white/25 text-[10px] mt-1">
            {elapsed < 60 ? `${elapsed}m ago` : `${Math.floor(elapsed / 60)}h ago`}
          </p>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs text-white/50">
            <span>{item.name}</span>
            <span className="text-white/30">×{item.qty}</span>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <p className="text-xs text-gold-DEFAULT/60 italic mb-3 bg-gold-DEFAULT/5 px-2 py-1.5 rounded-lg border border-gold-DEFAULT/10">
          📝 {order.specialInstructions}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-gold-DEFAULT font-semibold text-sm">₹{order.total}</span>
        {cfg?.next && (
          <button
            onClick={() => onUpdateStatus(order._id, cfg.next)}
            className="text-xs px-3 py-1.5 rounded-lg bg-gold-DEFAULT/10 text-gold-DEFAULT hover:bg-gold-DEFAULT/20 transition-colors font-medium"
          >
            {cfg.nextLabel} →
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function StaffDashboard() {
  const { user }    = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await orderAPI.getAll({ limit: 50 })
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

  // Real-time: when a new order comes in or status changes
  useSocket(user, (update) => {
    if (update.orderId && update.status) {
      // Status update
      setOrders(prev => prev.map(o =>
        (o._id === update._id || o.orderId === update.orderId)
          ? { ...o, status: update.status }
          : o
      ))
    } else {
      // New order — refetch
      fetchOrders()
    }
  })

  const handleUpdate = async (id, status) => {
    try {
      const { data } = await orderAPI.updateStatus(id, status)
      setOrders(prev => prev.map(o => o._id === id ? data.order : o))
      toast.success(`Order updated to ${STATUS_CONFIG[status]?.label || status}`, {
        style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(212,175,55,0.2)' }
      })
    } catch (err) {
      toast.error(err.message || 'Update failed', {
        style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(192,57,43,0.3)' }
      })
    }
  }

  const counts      = STATUS_FLOW.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {})
  const activeCount = orders.filter(o => o.status !== 'delivered').length

  return (
    <div className="min-h-screen bg-black pt-24 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-DEFAULT/10 border border-red-DEFAULT/30 flex items-center justify-center">
              <GiChefToque className="text-red-light text-xl" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">Kitchen Dashboard</h1>
              <p className="text-white/40 text-sm">
                {activeCount} active order{activeCount !== 1 ? 's' : ''} · Staff: {user?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-green-400 glass px-3 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
            </div>
            <button
              onClick={fetchOrders}
              className="p-2 rounded-lg glass-light text-white/40 hover:text-gold-DEFAULT transition-colors"
            >
              <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {STATUS_FLOW.map(s => {
            const cfg = STATUS_CONFIG[s]
            return (
              <motion.div key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card text-center">
                <cfg.icon className="text-xl mx-auto mb-1.5" style={{ color: cfg.color }} />
                <p className="font-display font-bold text-2xl text-white">{counts[s]}</p>
                <p className="text-white/30 text-xs mt-0.5">{cfg.label}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-gold-DEFAULT border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {STATUS_FLOW.map(status => {
              const cfg       = STATUS_CONFIG[status]
              const colOrders = orders.filter(o => o.status === status)
              return (
                <div key={status} className="glass-light rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <cfg.icon style={{ color: cfg.color }} className="text-base" />
                      <span className="font-semibold text-white text-sm">{cfg.label}</span>
                    </div>
                    <span className="text-xs font-bold text-white/40 glass px-2 py-0.5 rounded-full">{colOrders.length}</span>
                  </div>
                  <div className="min-h-24">
                    <AnimatePresence>
                      {colOrders.length === 0
                        ? <div className="text-center py-10 text-white/15 text-xs">No orders</div>
                        : colOrders.map(order => (
                          <OrderTicket key={order._id} order={order} onUpdateStatus={handleUpdate} />
                        ))
                      }
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
