import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { MenuProvider } from './context/MenuContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import UserDashboard from './pages/UserDashboard'
import StaffDashboard from './pages/StaffDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import ProfilePage from './pages/ProfilePage'
import { ServicesPage, ContactPage } from './pages/ServiceContactPages'

/* ─── Page transition wrapper ─────────────────────────────── */
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Layout (Navbar + Footer) ─────────────────────────────── */
function Layout({ children }) {
  return (
    <div className="grain-overlay">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

/* ─── Route definitions ────────────────────────────────────── */
function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ✅ Public Routes */}
        <Route
          path="/"
          element={
            <Layout>
              <PageTransition><HomePage /></PageTransition>
            </Layout>
          }
        />

  <Route
          path="/menu"
          element={
            <ProtectedRoute roles={['user']}>
              <Layout>
                <PageTransition><MenuPage /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/services"
          element={
            <Layout>
              <PageTransition><ServicesPage /></PageTransition>
            </Layout>
          }
        />

        <Route
          path="/contact"
          element={
            <Layout>
              <PageTransition><ContactPage /></PageTransition>
            </Layout>
          }
        />

        <Route
          path="/login"
          element={
            <PageTransition><LoginPage /></PageTransition>
          }
        />

        {/* 🚀 🔒 Cart → ONLY USER */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={['user']}>
              <Layout>
                <PageTransition><CartPage /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 🔒 Any Logged-in User */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition><ProfilePage /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 🔒 USER ONLY */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['user']}>
              <Layout>
                <PageTransition><UserDashboard /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 🔒 STAFF + MANAGER */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={['staff', 'manager']}>
              <Layout>
                <PageTransition><StaffDashboard /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 🔒 MANAGER ONLY */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute roles={['manager']}>
              <Layout>
                <PageTransition><ManagerDashboard /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ❌ 404 */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <p className="font-display font-black text-9xl text-gold-DEFAULT/10 mb-4">
                  404
                </p>
                <h1 className="font-display font-bold text-3xl text-white mb-3">
                  Page Not Found
                </h1>
                <p className="text-white/40 mb-8">
                  The page you're looking for doesn't exist.
                </p>
                <a
                  href="/"
                  className="btn-gold px-8 py-3 rounded-full text-sm font-semibold"
                >
                  Go Home
                </a>
              </div>
            </Layout>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

/* ─── App Wrapper ─────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MenuProvider>
          <CartProvider>

            <AppRoutes />

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1a1a1a',
                  color: '#f5f5f0',
                  border: '1px solid rgba(212,175,55,0.15)',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '14px',
                },
              }}
            />

          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}