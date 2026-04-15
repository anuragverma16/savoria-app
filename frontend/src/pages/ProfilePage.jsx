import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiSave, FiShield, FiEdit2 } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const TOASTCFG = { style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(212,175,55,0.2)' } }

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name is required', TOASTCFG); return }
    updateProfile(form)
    setEditing(false)
    toast.success('Profile updated!', TOASTCFG)
  }

  const roleColor = { user: '#3498db', staff: '#d4af37', manager: '#e74c3c' }
  const roleLabel = { user: 'Customer', staff: 'Kitchen Staff', manager: 'Manager / Admin' }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-3xl text-white mb-8">
          My <span className="text-gold-gradient">Profile</span>
        </motion.h1>

        {/* Avatar Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-DEFAULT to-red-dark flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 border-2 border-gold-DEFAULT/20">
            {user?.avatar}
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">{user?.name}</h2>
            <p className="text-white/40 text-sm mb-2">{user?.email}</p>
            <span className="text-xs px-3 py-1 rounded-full font-medium capitalize"
              style={{ background: `${roleColor[user?.role]}22`, color: roleColor[user?.role], border: `1px solid ${roleColor[user?.role]}44` }}>
              <FiShield className="inline mr-1 text-xs" /> {roleLabel[user?.role]}
            </span>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-white text-lg">Personal Information</h3>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${editing ? 'btn-gold' : 'btn-outline-gold'}`}
            >
              {editing ? <><FiSave /> Save</> : <><FiEdit2 /> Edit</>}
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                <input
                  value={form.name} onChange={set('name')} disabled={!editing}
                  className={`input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm ${!editing ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                <input
                  value={user?.email} disabled
                  className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm opacity-50 cursor-not-allowed"
                />
              </div>
              <p className="text-white/20 text-xs mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                <input
                  value={form.phone} onChange={set('phone')} disabled={!editing}
                  placeholder={editing ? '+91 98765 43210' : 'Not added'}
                  className={`input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm ${!editing ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Account Role</label>
              <div className="px-4 py-3 rounded-xl glass-light border border-white/5">
                <span className="text-white/50 text-sm capitalize">{roleLabel[user?.role]}</span>
              </div>
            </div>
          </div>

          {editing && (
            <button onClick={() => setEditing(false)} className="mt-4 text-sm text-white/30 hover:text-white/50 transition-colors">
              Cancel
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
