// Configuration utility for API endpoints and other settings

// Always use Render backend for deployed version
export const API_BASE_URL = 'https://mr-robot-backend.onrender.com';

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
};

export const getServiceUrl = (id) => `${API_BASE_URL}/api/admin/services/${id}`;
export const getCategoryUrl = (id) => `${API_BASE_URL}/api/admin/categories/${id}`;
export const getUserUrl = (id) => `${API_BASE_URL}/api/users/${id}`;
export const getArticleUrl = (id) => `${API_BASE_URL}/api/admin/articles/${id}`;
export const getBookingUrl = (id) => `${API_BASE_URL}/api/admin/bookings/${id}`;
