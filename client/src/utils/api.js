import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:612/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Projects
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};

// Messages
export const messagesAPI = {
  submit: (data) => api.post('/messages', data),
  getAll: () => api.get('/messages'),
  markRead: (id) => api.patch(`/messages/${id}/read`),
  delete: (id) => api.delete(`/messages/${id}`)
};

// Auth
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Settings
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
};

// Stats
export const statsAPI = {
  get: () => api.get('/stats')
};

// Upload
export const uploadAPI = {
  thumbnail: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  preview: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    });
  },
  delete: (type, filename) => api.delete(`/upload/${type}/${filename}`)
};

export default api;
