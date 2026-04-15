import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiGrid,
} from 'react-icons/fi'
import { GiKnifeFork } from 'react-icons/gi'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!user) return null
    if (user.role === 'manager') return '/manager'
    if (user.role === 'staff') return '/staff'
    return '/dashboard'
  }

  const role = user?.role || null
  const isUser = role === 'user'

  // ✅ NAV LINKS (MENU ONLY FOR USER)
  const navLinks = [
    { to: '/', label: 'Home' },

    // ONLY USER CAN SEE MENU
    ...(isUser ? [{ to: '/menu', label: 'Menu' }] : []),

    { to: '/services', label: 'Services' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass shadow-2xl shadow-black/50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* ── LOGO ── */}
        <Link to="/" className="flex items-center gap-2 group">
          <GiKnifeFork className="text-gold-DEFAULT text-2xl group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-display text-2xl font-bold text-gold-gradient">
            Savoria
          </span>
        </Link>

        {/* ── DESKTOP NAV ── */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `nav-link text-sm font-medium ${
                  isActive ? 'active' : ''
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* ── RIGHT ACTIONS ── */}
        <div className="hidden md:flex items-center gap-3">

          {/* CART ONLY FOR USER */}
          {isUser && (
            <Link
              to="/cart"
              className="relative p-2 rounded-full border border-gold-DEFAULT/20 hover:border-gold-DEFAULT/50 hover:bg-gold-DEFAULT/5 transition-all duration-300"
            >
              <FiShoppingCart className="text-gold-DEFAULT text-lg" />

              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </Link>
          )}

          {/* AUTH */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 py-2 px-3 rounded-full glass-light border-gold hover:border-gold-DEFAULT/50 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-DEFAULT to-red-dark flex items-center justify-center text-xs font-bold text-white">
                  {user.avatar}
                </div>
                <span className="text-sm text-white/80">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 glass border-gold rounded-xl overflow-hidden shadow-2xl"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm text-white">{user.name}</p>
                      <p className="text-xs text-white/40 capitalize">
                        {role}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-gold-DEFAULT"
                      >
                        <FiUser /> Profile
                      </Link>

                      {getDashboardLink() && (
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-gold-DEFAULT"
                        >
                          <FiGrid /> Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-light hover:bg-red-DEFAULT/10"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-gold px-5 py-2 rounded-full text-sm"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* ── MOBILE BUTTON ── */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5"
          >
            <div className="px-6 py-4 flex flex-col gap-2">

              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-white/70 hover:text-gold-DEFAULT"
                >
                  {link.label}
                </NavLink>
              ))}

              {isUser && (
                <Link
                  to="/cart"
                  className="text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Cart ({count})
                </Link>
              )}

              {!user && (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}