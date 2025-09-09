// Configuration utility for API endpoints and other settings

// Use local backend for development, production backend for deployed version
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : 'https://mr-robot-backend.onrender.com';

export const API_ENDPOINTS = {
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`,
  
  // Services endpoints
  SERVICES: `${API_BASE_URL}/api/services`,
  SERVICES_CATEGORIES: `${API_BASE_URL}/api/services/categories`,
  
  // Articles endpoints
  ARTICLES: `${API_BASE_URL}/api/articles`,
  
  // Contact endpoints
  CONTACT_SUBMIT: `${API_BASE_URL}/api/contact/submit`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  
  // Auth endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  
  // Admin endpoints
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
  ADMIN_SERVICES: `${API_BASE_URL}/api/admin/services`,
  ADMIN_USERS: `${API_BASE_URL}/api/users`,
  ADMIN_BOOKINGS: `${API_BASE_URL}/api/admin/bookings`,
  ADMIN_CONTACTS: `${API_BASE_URL}/api/admin/contacts`,
  ADMIN_CATEGORIES: `${API_BASE_URL}/api/admin/categories`,
};

export const getServiceUrl = (id) => `${API_BASE_URL}/api/admin/services/${id}`;
export const getCategoryUrl = (id) => `${API_BASE_URL}/api/admin/categories/${id}`;
export const getUserUrl = (id) => `${API_BASE_URL}/api/users/${id}`;
export const getArticleUrl = (id) => `${API_BASE_URL}/api/admin/articles/${id}`;
export const getBookingUrl = (id) => `${API_BASE_URL}/api/admin/bookings/${id}`;
