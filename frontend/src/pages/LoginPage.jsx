import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import { GiKnifeFork } from 'react-icons/gi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [mode, setMode] = useState('login')      // 'login' | 'signup'
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const getRedirect = (role) => {
    if (role === 'manager') return '/manager'
    if (role === 'staff')   return '/staff'
    return '/dashboard'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password)
        toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`, {
          style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(212,175,55,0.2)' }
        })
        navigate(getRedirect(user.role))
      } else {
        if (!form.name.trim()) throw new Error('Name is required')
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters')
        const user = await signup(form.name, form.email, form.password, form.role)
        toast.success(`Welcome to Savoria, ${user.name.split(' ')[0]}! 🎉`, {
          style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(212,175,55,0.2)' }
        })
        navigate(getRedirect(user.role))
      }
    } catch (err) {
      toast.error(err.message, {
        style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(192,57,43,0.3)' }
      })
    } finally {
      setLoading(false)
    }
  }

  // // Quick fill demo accounts
  // const fillDemo = (role) => {
  //   const demos = {
  //     user:    { email: 'user@savoria.com',    password: 'user123' },
  //     staff:   { email: 'staff@savoria.com',   password: 'staff123' },
  //     manager: { email: 'manager@savoria.com', password: 'manager123' },
  //   }
  //   setForm(p => ({ ...p, ...demos[role] }))
  //   setMode('login')
  // }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80"
          alt="Restaurant"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <GiKnifeFork className="text-gold-DEFAULT text-3xl" />
            <span className="font-display text-3xl font-bold text-gold-gradient">Savoria</span>
          </Link>
          <h2 className="font-display font-black text-5xl text-white leading-none mb-6">
            A Culinary<br />
            <span className="text-gold-gradient italic">Journey Awaits</span>
          </h2>
          <p className="text-white/50 text-lg font-light leading-relaxed max-w-sm mb-12">
            Sign in to unlock your personalised dining experience, track orders, and reserve your table.
          </p>
          
          {/* <div className="flex flex-col gap-3">
            {[
              { role: 'user',    label: 'Demo User',    desc: 'Browse menu & order' },
              { role: 'staff',   label: 'Demo Staff',   desc: 'Manage orders' },
              { role: 'manager', label: 'Demo Manager', desc: 'Admin dashboard' },
            ].map(d => (
              <button
                key={d.role}
                onClick={() => fillDemo(d.role)}
                className="text-left glass px-4 py-3 rounded-xl border-gold hover:border-gold-DEFAULT/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{d.label}</p>
                    <p className="text-white/40 text-xs">{d.desc}</p>
                  </div>
                  <FiArrowRight className="text-gold-DEFAULT/40 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div> */}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-16 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <GiKnifeFork className="text-gold-DEFAULT text-2xl" />
            <span className="font-display text-2xl font-bold text-gold-gradient">Savoria</span>
          </Link>

          {/* Tab Toggle */}
          <div className="glass rounded-full p-1 flex mb-8">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all capitalize ${mode === m ? 'bg-gradient-to-r from-red-dark to-red-DEFAULT text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display font-bold text-3xl text-white mb-1">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-white/40 text-sm mb-8">
                {mode === 'login' ? 'Sign in to continue your culinary journey' : 'Join Savoria for an exclusive dining experience'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (signup only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input type="text" placeholder="Your full name" value={form.name} onChange={set('name')} required className="input-dark w-full pl-11 pr-4 py-3.5 rounded-xl text-sm" />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required className="input-dark w-full pl-11 pr-4 py-3.5 rounded-xl text-sm" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required className="input-dark w-full pl-11 pr-11 py-3.5 rounded-xl text-sm" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Role (signup only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Account Type</label>
                    <select value={form.role} onChange={set('role')} className="input-dark  w-full px-4 py-3.5 rounded-xl text-sm cursor-pointer">
                      <option value="user" className='bg-black'>Customer</option>
                      <option value="staff" className='bg-black'>Staff Member</option>
                      <option value="manager" className='bg-black'>Manager / Admin</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-4 rounded-xl text-base font-semibold mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Please wait...</>
                  ) : (
                    <>{mode === 'login' ? 'Sign In' : 'Create Account'} <FiArrowRight /></>
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
