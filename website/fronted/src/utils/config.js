// Configuration utility for API endpoints and other settings

// Detect if we're on mobile/tablet and use appropriate backend URL
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const API_BASE_URL = isMobile 
  ? 'http://192.168.1.13:3001' 
  : (process.env.REACT_APP_BACKEND_URL || 'https://mr-robot-backend.onrender.com');

export const API_ENDPOINTS = {
  // Auth endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  
  // Services endpoints
  SERVICES: `${API_BASE_URL}/api/services`,
  ADMIN_SERVICES: `${API_BASE_URL}/api/admin/services`,
  ADMIN_CATEGORIES: `${API_BASE_URL}/api/admin/categories`,
  
  // Articles endpoints
  ARTICLES_MEDIUM: `${API_BASE_URL}/api/articles/medium`,
  ARTICLES: `${API_BASE_URL}/api/articles`,
  
  // Contact endpoints
  CONTACT_SUBMIT: `${API_BASE_URL}/api/contact/submit`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  
  // User endpoints
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  
  // Admin endpoints
  ADMIN_USERS: `${API_BASE_URL}/api/users`,
  ADMIN_ARTICLES: `${API_BASE_URL}/api/admin/articles`,
  ADMIN_BOOKINGS: `${API_BASE_URL}/api/admin/bookings`,
  ADMIN_CONTACTS: `${API_BASE_URL}/api/admin/contacts`,
  ADMIN_ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
};

export const getServiceUrl = (id) => `${API_BASE_URL}/api/admin/services/${id}`;
export const getCategoryUrl = (id) => `${API_BASE_URL}/api/admin/categories/${id}`;
export const getUserUrl = (id) => `${API_BASE_URL}/api/users/${id}`;
export const getArticleUrl = (id) => `${API_BASE_URL}/api/admin/articles/${id}`;
export const getBookingUrl = (id) => `${API_BASE_URL}/api/admin/bookings/${id}`;
