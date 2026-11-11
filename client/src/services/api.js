import axios from 'axios';
import { clientDemoUser, clientDemoMessages, clientDemoGroups } from './clientDemoData';

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
  getStatus: async () => {
    try {
      return await api.get('/auth/status');
    } catch {
      return { data: { isAuthenticated: false, isDemo: false, isOAuthConfigured: false } };
    }
  },
  restoreSession: async (data) => {
    try {
      return await api.post('/auth/restore-session', data);
    } catch {
      if (data && (data.isDemo || data.user)) {
        return {
          data: {
            isAuthenticated: true,
            user: data.user || clientDemoUser,
            isDemo: true,
            token: data.token || 'demo_client_token'
          }
        };
      }
      return { data: { isAuthenticated: false, isDemo: false } };
    }
  },
  getAuthUrl: () => api.get('/auth/url'),
  startDemo: async () => {
    try {
      return await api.post('/auth/demo');
    } catch {
      // Seamless client-side demo fallback for GitHub Pages!
      return {
        data: {
          success: true,
          message: 'Demo mode activated',
          user: clientDemoUser,
          isDemo: true,
          token: 'demo_client_token'
        }
      };
    }
  },
  quickLogin: async (data) => {
    try {
      return await api.post('/auth/quick-login', data);
    } catch {
      const customUser = {
        ...clientDemoUser,
        email: data?.email || clientDemoUser.email,
        name: data?.name || clientDemoUser.name
      };
      return {
        data: {
          success: true,
          user: customUser,
          isDemo: true,
          token: 'demo_custom_token'
        }
      };
    }
  },
  saveCredentials: (data) => api.post('/auth/save-credentials', data),
  logout: async () => {
    try {
      return await api.post('/auth/logout');
    } catch {
      return { data: { success: true } };
    }
  },
  disconnect: async () => {
    try {
      return await api.post('/auth/disconnect');
    } catch {
      return { data: { success: true } };
    }
  },
};

export const mailApi = {
  search: async (params = {}) => {
    try {
      return await api.get('/mail/search', { params });
    } catch {
      const searchSub = (params.subject || '').toLowerCase().trim();
      const filtered = clientDemoMessages.filter(m => {
        if (!searchSub) return true;
        return (m.subject || '').toLowerCase().includes(searchSub);
      });
      return {
        data: {
          messages: filtered,
          totalEstimate: filtered.length,
          queryUsed: `subject:${params.subject || 'Campus Recruitment'}`
        }
      };
    }
  },
  getMessage: async (id) => {
    try {
      return await api.get(`/mail/message/${id}`);
    } catch {
      const found = clientDemoMessages.find(m => m.id === id) || clientDemoMessages[0];
      return { data: { message: found } };
    }
  },
  getGroups: async () => {
    try {
      return await api.get('/mail/groups');
    } catch {
      return { data: { groups: clientDemoGroups } };
    }
  },
  getStats: async (subject) => {
    try {
      return await api.get('/mail/stats', { params: { subject } });
    } catch {
      const searchSub = (subject || '').toLowerCase().trim();
      const filtered = clientDemoMessages.filter(m => {
        if (!searchSub) return true;
        return (m.subject || '').toLowerCase().includes(searchSub);
      });
      const gmailCount = filtered.filter(m => m.source === 'Gmail').length;
      const groupCount = filtered.filter(m => m.source === 'Google Group').length;
      return {
        data: {
          stats: {
            totalMatching: filtered.length,
            gmailCount,
            groupCount,
            totalGroups: clientDemoGroups.length,
            activeSubject: subject || 'Campus Recruitment',
            latestMessageDate: filtered[0]?.date || '10 Nov 2026'
          }
        }
      };
    }
  },
  getAttachmentUrl: (messageId, attachmentId, filename) =>
    `${BASE_API_URL}/mail/attachment/${messageId}/${attachmentId}?filename=${encodeURIComponent(filename)}`,
};

export default api;
