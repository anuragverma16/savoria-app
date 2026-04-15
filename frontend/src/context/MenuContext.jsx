import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { menuAPI, orderAPI } from '../api'

const MenuContext = createContext(null)

export function MenuProvider({ children }) {
  const [menuItems,  setMenuItems]  = useState([])
  const [orders,     setOrders]     = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading,    setLoading]    = useState(true)

  // ── Fetch menu from backend ────────────────────────────────
  const fetchMenu = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const { data } = await menuAPI.getAll(params)
      setMenuItems(data.items)
      setCategories(data.categories || ['All'])
    } catch (err) {
      console.error('Failed to fetch menu:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch orders (for staff/manager) ──────────────────────
  const fetchOrders = useCallback(async (params = {}) => {
    try {
      const { data } = await orderAPI.getAll(params)
      setOrders(data.orders)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
  }, [])

  // ── Load on mount ──────────────────────────────────────────
  useEffect(() => { fetchMenu() }, [fetchMenu])

  
  // ── Manager: Add menu item ─────────────────────────────────
  const addMenuItem = async (formData) => {
    const { data } = await menuAPI.create(formData)
    setMenuItems(prev => [data.item, ...prev])
    return data.item
  }

  // ── Manager: Update menu item ──────────────────────────────
  const updateMenuItem = async (id, formData) => {
    const { data } = await menuAPI.update(id, formData)
    setMenuItems(prev => prev.map(i => i._id === id ? data.item : i))
    return data.item
  }

  // ── Manager: Delete menu item ──────────────────────────────
  const deleteMenuItem = async (id) => {
    await menuAPI.delete(id)
    setMenuItems(prev => prev.filter(i => i._id !== id))
  }

  // ── User: Place order ──────────────────────────────────────
  const placeOrder = async (orderData) => {
    const { data } = await orderAPI.create(orderData)
    return data.order
  }

  // ── Staff: Update order status ─────────────────────────────
  const updateOrderStatus = async (orderId, status) => {
    const { data } = await orderAPI.updateStatus(orderId, status)
    setOrders(prev => prev.map(o => o._id === orderId ? data.order : o))
    return data.order
  }

  return (
    <MenuContext.Provider value={{
      menuItems, orders, categories, loading,
      fetchMenu, fetchOrders,
      addMenuItem, updateMenuItem, deleteMenuItem,
      placeOrder, updateOrderStatus,
    }}>
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = () => {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useMenu must be used inside MenuProvider')
  return ctx
}
