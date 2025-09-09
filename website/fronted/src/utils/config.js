// Configuration utility for API endpoints and other settings

// Use Vercel API routes for production, local backend for development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs for Vercel API routes
  : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001');

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
  
  // Auth endpoints (for future admin features)
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
};

export const getServiceUrl = (id) => `${API_BASE_URL}/api/admin/services/${id}`;
export const getCategoryUrl = (id) => `${API_BASE_URL}/api/admin/categories/${id}`;
export const getUserUrl = (id) => `${API_BASE_URL}/api/users/${id}`;
export const getArticleUrl = (id) => `${API_BASE_URL}/api/admin/articles/${id}`;
export const getBookingUrl = (id) => `${API_BASE_URL}/api/admin/bookings/${id}`;
