import axios from 'axios';

// Determine base API URL:
// In production (e.g. GitHub Pages), VITE_API_URL will point to the deployed backend (e.g., https://your-backend.onrender.com)
// In local development without VITE_API_URL, it defaults to '/api' which is proxied by Vite to http://127.0.0.1:5050
const rawApiUrl = import.meta.env.VITE_API_URL || '';
const getBaseApiUrl = () => {
  if (!rawApiUrl) return '/api';
  const clean = rawApiUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const BASE_API_URL = getBaseApiUrl();

const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach persistent auth token to every outgoing request
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('subject_mail_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // localStorage might be unavailable in restricted sandbox
  }
  return config;
});

export const authApi = {
  getStatus: () => api.get('/auth/status'),
  restoreSession: (data) => api.post('/auth/restore-session', data),
  getAuthUrl: () => api.get('/auth/url'),
  startDemo: () => api.post('/auth/demo'),
  quickLogin: (data) => api.post('/auth/quick-login', data),
  saveCredentials: (data) => api.post('/auth/save-credentials', data),
  logout: () => api.post('/auth/logout'),
  disconnect: () => api.post('/auth/disconnect'),
};

export const mailApi = {
  search: (params) => api.get('/mail/search', { params }),
  getMessage: (id) => api.get(`/mail/message/${id}`),
  getGroups: () => api.get('/mail/groups'),
  getStats: (subject) => api.get('/mail/stats', { params: { subject } }),
  getAttachmentUrl: (messageId, attachmentId, filename) =>
    `${BASE_API_URL}/mail/attachment/${messageId}/${attachmentId}?filename=${encodeURIComponent(filename)}`,
};

export default api;

