import axios from 'axios'

// ── Base axios instance ───────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.CLIENT_URL,       // Vite proxy forwards to http://localhost:5000
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT token ─────────────────────
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('savoria_user') || '{}')
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 globally ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('savoria_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  register:        (data) => api.post('/auth/register', data),
  login:           (data) => api.post('/auth/login', data),
  getMe:           ()     => api.get('/auth/me'),
  updateProfile:   (data) => api.put('/auth/update-profile', data),
  changePassword:  (data) => api.put('/auth/change-password', data),
  logout:          ()     => api.post('/auth/logout'),
}

// ─────────────────────────────────────────────────────────────
// Menu API
// ─────────────────────────────────────────────────────────────
export const menuAPI = {
  getAll:               (params) => api.get('/menu', { params }),
  getBestsellers:       ()       => api.get('/menu/bestsellers'),
  getOne:               (id)     => api.get(`/menu/${id}`),
  create:               (data)   => api.post('/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:               (id, data) => api.put(`/menu/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:               (id)     => api.delete(`/menu/${id}`),
  toggleAvailability:   (id)     => api.patch(`/menu/${id}/toggle-availability`),
}

// ─────────────────────────────────────────────────────────────
// Order API
// ─────────────────────────────────────────────────────────────
export const orderAPI = {
  create:           (data)   => api.post('/orders', data),
  getMyOrders:      (params) => api.get('/orders/my-orders', { params }),
  getAll:           (params) => api.get('/orders', { params }),
  getOne:           (id)     => api.get(`/orders/${id}`),
  updateStatus:     (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel:           (id)     => api.patch(`/orders/${id}/cancel`),
  getAnalytics:     (params) => api.get('/orders/analytics', { params }),
}

// ─────────────────────────────────────────────────────────────
// User API (manager)
// ─────────────────────────────────────────────────────────────
export const userAPI = {
  getAll:           (params) => api.get('/users', { params }),
  getOne:           (id)     => api.get(`/users/${id}`),
  updateRole:       (id, role)     => api.put(`/users/${id}/role`, { role }),
  toggleActive:     (id)           => api.patch(`/users/${id}/toggle-active`),
  delete:           (id)           => api.delete(`/users/${id}`),
}

// ─────────────────────────────────────────────────────────────
// Review API
// ─────────────────────────────────────────────────────────────
export const reviewAPI = {
  create:           (data) => api.post('/reviews', data),
  getForItem:       (menuItemId) => api.get(`/reviews/menu/${menuItemId}`),
  delete:           (id) => api.delete(`/reviews/${id}`),
}

export default api
