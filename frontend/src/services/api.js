import axios from "axios";

// ✅ Smart API URL detection - works for localhost & production
const getBaseURL = () => {
  // Check environment variable first
  let url = process.env.REACT_APP_API_URL;

  // If env variable exists, clean it up
  if (url) {
    // Remove trailing slash
    url = url.replace(/\/$/, "");
    // Remove trailing /api if someone accidentally added it
    url = url.replace(/\/api$/, "");
    return url;
  }

  // Fallback based on environment
  if (process.env.NODE_ENV === "production") {
    return "https://yourbrewhaven.onrender.com";
  }

  // Development fallback
  return "https://yourbrewhaven.onrender.com";
};

const API_URL = getBaseURL();

// Debug log only in development
if (process.env.NODE_ENV !== "production") {
  console.log("🔍 API_URL:", API_URL);
  console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second timeout
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      console.error("Network Error - Server may be down");
      return Promise.reject(error);
    }

    // Unauthorized - clear auth data
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  getProfile: () => api.get("/api/auth/profile"),
  updateProfile: (data) => api.put("/api/auth/profile", data),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/api/categories"),
  getAllAdmin: () => api.get("/api/categories/all"),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post("/api/categories", data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get("/api/products", { params }),
  getAllAdmin: () => api.get("/api/products/all"),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post("/api/products", data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
  updateStock: (id, stock) => api.patch(`/api/products/${id}/stock`, { stock }),
};

// Orders API
export const ordersAPI = {
  getMyOrders: () => api.get("/api/orders/my-orders"),
  getAll: (params) => api.get("/api/orders", { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post("/api/orders", data),
  updateStatus: (id, status) =>
    api.put(`/api/orders/${id}/status`, { orderStatus: status }),
  createRazorpayOrder: (amount) =>
    api.post("/api/orders/create-razorpay-order", { amount }),
  verifyPayment: (data) => api.post("/api/orders/verify-payment", data),
  getStats: () => api.get("/api/orders/stats/summary"),
  getShopStatus: () => api.get("/api/orders/shop-status"),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get("/api/notifications", { params }),
  getUnreadCount: () => api.get("/api/notifications/unread-count"),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put("/api/notifications/mark-all-read"),
  delete: (id) => api.delete(`/api/notifications/${id}`),
  clearAll: () => api.delete("/api/notifications"),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId) =>
    api.get(`/api/reviews/product/${productId}`),
  getMyReview: (productId) =>
    api.get(`/api/reviews/product/${productId}/my-review`),
  getMyReviews: () => api.get("/api/reviews/my-reviews"),
  canReview: (productId) => api.get(`/api/reviews/can-review/${productId}`),
  getReviewableProducts: () => api.get("/api/reviews/reviewable-products"),
  getReviewableOrders: () => api.get("/api/reviews/reviewable-orders"),
  canReviewOrder: (orderId) =>
    api.get(`/api/reviews/can-review-order/${orderId}`),
  create: (data) => api.post("/api/reviews", data),
  bulkReview: (data) => api.post("/api/reviews/bulk-review", data),
  update: (id, data) => api.put(`/api/reviews/${id}`, data),
  delete: (id) => api.delete(`/api/reviews/${id}`),
  markHelpful: (id) => api.post(`/api/reviews/${id}/helpful`),
  getAllReviews: () => api.get("/api/reviews/admin/all"),
  approveReview: (id, isApproved) =>
    api.patch(`/api/reviews/${id}/approve`, { isApproved }),
  respondToReview: (id, message) =>
    api.post(`/api/reviews/${id}/respond`, { message }),
  deleteReview: (id) => api.delete(`/api/reviews/admin/${id}`),
};

// Coupons API
export const couponsAPI = {
  getAll: () => api.get("/api/coupons"),
  getActive: () => api.get("/api/coupons/active"),
  getById: (id) => api.get(`/api/coupons/${id}`),
  validate: (code, orderAmount) =>
    api.post("/api/coupons/validate", { code, orderAmount }),
  create: (data) => api.post("/api/coupons", data),
  update: (id, data) => api.put(`/api/coupons/${id}`, data),
  delete: (id) => api.delete(`/api/coupons/${id}`),
  toggle: (id) => api.patch(`/api/coupons/${id}/toggle`),
};

// Contacts API
export const contactsAPI = {
  submit: (data) => api.post("/api/contacts", data),
  submitPartyOrder: (data) => api.post("/api/contacts/party-order", data),
  getAll: (params) => api.get("/api/contacts", { params }),
  getById: (id) => api.get(`/api/contacts/${id}`),
  updateStatus: (id, data) => api.put(`/api/contacts/${id}/status`, data),
  markAsRead: (id) => api.put(`/api/contacts/${id}/read`),
  delete: (id) => api.delete(`/api/contacts/${id}`),
  getStats: () => api.get("/api/contacts/stats/summary"),
};

// Admin API
export const adminAPI = {
  getSettings: () => api.get("/api/admin/settings"),
  updateSettings: (data) => api.put("/api/admin/settings", data),
  toggleShop: () => api.put("/api/admin/toggle-shop"),
  getUsers: () => api.get("/api/admin/users"),
  updateUserRole: (id, role) =>
    api.put(`/api/admin/users/${id}/role`, { role }),
};

export default api;
