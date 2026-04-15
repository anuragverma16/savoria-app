import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiList, FiUsers, FiBarChart2, FiPlus, FiEdit2, FiTrash2,
  FiX, FiSave, FiTrendingUp, FiShoppingBag, FiDollarSign, FiStar
} from 'react-icons/fi'
import { GiKnifeFork } from 'react-icons/gi'
import { useMenu } from '../context/MenuContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['Starters', 'Main Course', 'Biryani', 'Breads', 'Desserts', 'Drinks']

const TOASTCFG = { style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(212,175,55,0.2)' } }

// ─── Menu Item Form Modal ─────────────────────────────────────
function MenuItemModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item || {
    name: '', category: 'Starters', price: '', description: '',
    image: '', prepTime: '15 min', calories: '', isVeg: true, isBestseller: false, rating: 4.5
  })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const toggle = k => () => setForm(p => ({ ...p, [k]: !p[k] }))

  const handleSave = () => {
    if (!form.name || !form.price) { toast.error('Name and price are required', TOASTCFG); return }
    onSave({ ...form, price: Number(form.price), calories: Number(form.calories) || 0 })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-gold"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-display font-semibold text-xl text-white">{item ? 'Edit Dish' : 'Add New Dish'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-all"><FiX /></button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Dish Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Butter Chicken" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Category</label>
            <select value={form.category} onChange={set('category')} className="input-dark w-full px-4 py-3 rounded-xl text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Price (₹) *</label>
            <input type="number" value={form.price} onChange={set('price')} placeholder="e.g. 599" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Prep Time</label>
            <input value={form.prepTime} onChange={set('prepTime')} placeholder="e.g. 15 min" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Calories</label>
            <input type="number" value={form.calories} onChange={set('calories')} placeholder="e.g. 450" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Image URL</label>
            <input value={form.image} onChange={set('image')} placeholder="https://..." className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe the dish..." className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none" />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button
              type="button"
              onClick={toggle('isVeg')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.isVeg ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'glass-light border-white/10 text-white/40'}`}
            >
              🌿 Vegetarian
            </button>
            <button
              type="button"
              onClick={toggle('isBestseller')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.isBestseller ? 'bg-gold-DEFAULT/15 border-gold-DEFAULT/40 text-gold-DEFAULT' : 'glass-light border-white/10 text-white/40'}`}
            >
              ★ Bestseller
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-outline-gold py-3 rounded-xl text-sm font-semibold">Cancel</button>
          <button onClick={handleSave} className="flex-1 btn-gold py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <FiSave /> {item ? 'Save Changes' : 'Add Dish'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────
function AnalyticsTab({ orders, menuItems }) {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const delivered    = orders.filter(o => o.status === 'delivered').length
  const avgOrder     = orders.length ? Math.round(totalRevenue / orders.length) : 0

  const catRevenue = menuItems.reduce((acc, item) => {
    const cat = item.category
    const itemOrders = orders.flatMap(o => o.items).filter(i => i.name === item.name)
    const rev = itemOrders.reduce((s, i) => s + i.price * i.qty, 0)
    acc[cat] = (acc[cat] || 0) + rev
    return acc
  }, {})

  const topItems = menuItems.map(item => {
    const qty = orders.flatMap(o => o.items).filter(i => i.name === item.name).reduce((s, i) => s + i.qty, 0)
    return { ...item, soldQty: qty }
  }).sort((a, b) => b.soldQty - a.soldQty).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: '#d4af37' },
          { label: 'Total Orders', value: orders.length, icon: FiShoppingBag, color: '#3498db' },
          { label: 'Delivered', value: delivered, icon: FiTrendingUp, color: '#27ae60' },
          { label: 'Avg. Order Value', value: `₹${avgOrder}`, icon: FiStar, color: '#e74c3c' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon style={{ color: kpi.color }} className="text-lg" />
            </div>
            <p className="font-display font-bold text-2xl text-white">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-white mb-5">Revenue by Category</h3>
          <div className="space-y-3">
            {Object.entries(catRevenue).sort((a, b) => b[1] - a[1]).map(([cat, rev]) => {
              const maxRev = Math.max(...Object.values(catRevenue))
              const pct = maxRev > 0 ? (rev / maxRev) * 100 : 0
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">{cat}</span>
                    <span className="text-gold-DEFAULT font-medium">₹{rev.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #c0392b, #d4af37)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-white mb-5">Top Selling Dishes</h3>
          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-white/20 text-sm font-bold w-5">#{i + 1}</span>
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-white/30 text-xs">{item.category}</p>
                </div>
                <span className="text-gold-DEFAULT text-sm font-semibold">{item.soldQty} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-display font-semibold text-white mb-5">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="text-left pb-3">Order ID</th>
                <th className="text-left pb-3">Customer</th>
                <th className="text-left pb-3">Items</th>
                <th className="text-right pb-3">Total</th>
                <th className="text-right pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.slice(0, 6).map(order => {
                const cfg = { pending: 'status-pending', preparing: 'status-preparing', ready: 'status-ready', delivered: 'status-delivered' }
                return (
                  <tr key={order._id} className="text-white/60 hover:text-white/80 transition-colors">
                    <td className="py-3 font-mono text-xs text-gold-DEFAULT/70">{order._id}</td>
                    <td className="py-3">{order.userName}</td>
                    <td className="py-3 text-white/30">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                    <td className="py-3 text-right text-gold-DEFAULT font-semibold">₹{order.total}</td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${cfg[order.status]}`}>{order.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Menu Management Tab ──────────────────────────────────────
function MenuManagementTab({ menuItems, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const cats = ['All', ...CATEGORIES]

  const filtered = menuItems
    .filter(i => catFilter === 'All' || i.category === catFilter)
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text" placeholder="Search dishes..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark flex-1 px-4 py-2.5 rounded-xl text-sm"
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-dark px-4 py-2.5 rounded-xl text-sm">
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => onAdd()} className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
          <FiPlus /> Add Dish
        </button>
      </div>

     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {filtered.map(item => (
    <motion.div key={item._id} layout className="glass rounded-xl overflow-hidden group">
      
      <div className="relative h-36">
        <img
          src={item.image?.url}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => {
            e.target.src = ''
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="w-7 h-7 rounded-lg bg-gold-DEFAULT/20 text-gold-DEFAULT hover:bg-gold-DEFAULT/40 flex items-center justify-center transition-colors">
            <FiEdit2 className="text-xs" />
          </button>
          <button onClick={() => onDelete(item._id)} className="w-7 h-7 rounded-lg bg-red-DEFAULT/20 text-red-light hover:bg-red-DEFAULT/40 flex items-center justify-center transition-colors">
            <FiTrash2 className="text-xs" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 flex gap-1.5">
          {item.isBestseller && (
            <span className="text-[9px] bg-gold-DEFAULT text-black font-bold px-1.5 py-0.5 rounded-full">
              BEST
            </span>
          )}

          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            item.isVeg ? 'bg-green-500/80 text-white' : 'bg-red-DEFAULT/80 text-white'
          }`}>
            {item.isVeg ? 'VEG' : 'NON-VEG'}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{item.name}</p>
            <p className="text-white/30 text-xs">
              {item.category} · ⭐ {item.rating?.average || 0}
            </p>
          </div>
          <span className="text-gold-DEFAULT font-bold text-sm flex-shrink-0">
            ₹{item.price}
          </span>
        </div>
      </div>

    </motion.div>
  ))}
</div>
    </div>
  )
}

// ─── Main Manager Dashboard ───────────────────────────────────


export default function ManagerDashboard() {
  const { menuItems, orders, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu()
  const { user } = useAuth()
  const [tab, setTab] = useState('analytics')
  const [modal, setModal] = useState(null)   // null | { mode: 'add' | 'edit', item?: {} }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
    { id: 'menu',      label: 'Menu',      icon: GiKnifeFork },
    { id: 'orders',    label: 'Orders',    icon: FiList },
  ]

  const handleSave = (data) => {
    if (modal.mode === 'add') {
      addMenuItem(data)
      toast.success('Dish added to menu!', TOASTCFG)
    } else {
      updateMenuItem(modal.item._id, data)
      toast.success('Dish updated!', TOASTCFG)
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    deleteMenuItem(id)
    toast.success('Dish removed from menu', TOASTCFG)
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gold-DEFAULT text-xs uppercase tracking-[4px]">Manager</span>
            </div>
            <h1 className="font-display font-bold text-3xl text-white">Admin Dashboard</h1>
            <p className="text-white/30 text-sm mt-1">Welcome, {user?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-white/30 text-xs">{menuItems.length} dishes · {orders.length} orders</p>
          </div>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-8 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-gradient-to-r from-red-dark to-red-DEFAULT text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
            >
              <t.icon className="text-base" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === 'analytics' && <AnalyticsTab orders={orders} menuItems={menuItems} />}
            {tab === 'menu' && (
              <MenuManagementTab
                menuItems={menuItems}
                onAdd={() => setModal({ mode: 'add' })}
                onEdit={item => setModal({ mode: 'edit', item })}
                onDelete={handleDelete}
              />
            )}
            {tab === 'orders' && (
              <div className="glass rounded-2xl p-5 overflow-x-auto">
                <h3 className="font-display font-semibold text-white mb-5">All Orders</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
                      <th className="text-left pb-3">Order ID</th>
                      <th className="text-left pb-3">Customer</th>
                      <th className="text-left pb-3">Table</th>
                      <th className="text-left pb-3">Items</th>
                      <th className="text-right pb-3">Total</th>
                      <th className="text-right pb-3">Status</th>
                      <th className="text-right pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map(order => {
                      const statusCls = { pending: 'status-pending', preparing: 'status-preparing', ready: 'status-ready', delivered: 'status-delivered' }
                      return (
                        <tr key={order._id} className="text-white/50 hover:text-white/80 transition-colors">
                          <td className="py-3 font-mono text-xs text-gold-DEFAULT/70">{order._id}</td>
                          <td className="py-3">{order.userName}</td>
                          <td className="py-3 text-white/30">{order.tableNo || '—'}</td>
                          <td className="py-3 text-white/30">{order.items.length}</td>
                          <td className="py-3 text-right text-gold-DEFAULT font-semibold">₹{order.total}</td>
                          <td className="py-3 text-right">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusCls[order.status]}`}>{order.status}</span>
                          </td>
                          <td className="py-3 text-right text-xs text-white/30">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Menu Item Modal */}
      <AnimatePresence>
        {modal && (
          <MenuItemModal
            item={modal.item}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
