// Configuration API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/auth/login/`,
  LOGOUT: `${API_URL}/api/auth/logout/`,
  REFRESH: `${API_URL}/api/auth/refresh/`,
  ME: `${API_URL}/api/auth/me/`,
  SESSIONS: `${API_URL}/api/auth/sessions/`,
  
  // Videos (user)
  DASHBOARD: `${API_URL}/api/dashboard/`,
  VIDEOS: `${API_URL}/api/videos/`,
  VIDEO_DETAIL: (id: number) => `${API_URL}/api/videos/${id}/`,
  CATEGORIES: `${API_URL}/api/categories/`,
  CATEGORY_DETAIL: (id: number) => `${API_URL}/api/categories/${id}/`,
  
  // Admin API
  ADMIN: {
    DASHBOARD: `${API_URL}/api/admin/dashboard/`,
    // Users
    USERS: `${API_URL}/api/admin/users/`,
    USER_DETAIL: (id: number) => `${API_URL}/api/admin/users/${id}/`,
    USER_INVALIDATE_SESSIONS: (id: number) => `${API_URL}/api/admin/users/${id}/invalidate-sessions/`,
    // Categories
    CATEGORIES: `${API_URL}/api/admin/categories/`,
    CATEGORY_DETAIL: (id: number) => `${API_URL}/api/admin/categories/${id}/`,
    // Videos
    VIDEOS: `${API_URL}/api/admin/videos/`,
    VIDEO_DETAIL: (id: number) => `${API_URL}/api/admin/videos/${id}/`,
  }
};

export default API_URL;
