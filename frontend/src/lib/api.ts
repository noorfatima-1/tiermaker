import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        const token = data.data?.accessToken || data.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  register: (data: { email: string; username: string; displayName: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// Playgrounds API
export const playgroundsApi = {
  getAll: (page = 1, limit = 12, search?: string) =>
    api.get('/playgrounds', { params: { page, limit, search } }),
  getTrending: (limit = 6) =>
    api.get('/playgrounds/trending', { params: { limit } }),
  getBySlug: (slug: string) =>
    api.get(`/playgrounds/${slug}`),
  getByInviteCode: (code: string) =>
    api.get(`/playgrounds/invite/${code}`),
  getAdmin: (page = 1, limit = 20) =>
    api.get('/playgrounds/admin', { params: { page, limit } }),
  create: (data: any) => api.post('/playgrounds', data),
  update: (id: string, data: any) => api.put(`/playgrounds/${id}`, data),
  delete: (id: string) => api.delete(`/playgrounds/${id}`),
  toggleLock: (id: string) => api.patch(`/playgrounds/${id}/toggle-lock`),
  resetVotes: (id: string) => api.post(`/playgrounds/${id}/reset-votes`),
};

// Tiers API
export const tiersApi = {
  getByPlayground: (playgroundId: string) =>
    api.get(`/playgrounds/${playgroundId}/tiers`),
  create: (playgroundId: string, data: any) =>
    api.post(`/playgrounds/${playgroundId}/tiers`, data),
  createBatch: (playgroundId: string, tiers: any[]) =>
    api.post(`/playgrounds/${playgroundId}/tiers/batch`, { tiers }),
  update: (playgroundId: string, id: string, data: any) =>
    api.put(`/playgrounds/${playgroundId}/tiers/${id}`, data),
  delete: (playgroundId: string, id: string) =>
    api.delete(`/playgrounds/${playgroundId}/tiers/${id}`),
};

// Items API
export const itemsApi = {
  getByPlayground: (playgroundId: string) =>
    api.get(`/playgrounds/${playgroundId}/items`),
  create: (playgroundId: string, data: any) =>
    api.post(`/playgrounds/${playgroundId}/items`, data),
  createBatch: (playgroundId: string, items: any[]) =>
    api.post(`/playgrounds/${playgroundId}/items/batch`, { items }),
  update: (playgroundId: string, id: string, data: any) =>
    api.put(`/playgrounds/${playgroundId}/items/${id}`, data),
  delete: (playgroundId: string, id: string) =>
    api.delete(`/playgrounds/${playgroundId}/items/${id}`),
};

// Votes API
export const votesApi = {
  cast: (itemId: string, tierId: string) =>
    api.post('/votes', { itemId, tierId }),
  getPlaygroundAggregates: (playgroundId: string) =>
    api.get(`/votes/playground/${playgroundId}`),
  getUserVotes: (playgroundId: string) =>
    api.get(`/votes/user/${playgroundId}`),
  remove: (itemId: string) => api.delete(`/votes/${itemId}`),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPlayground: (playgroundId: string) =>
    api.get(`/analytics/playground/${playgroundId}`),
  getActivityFeed: (page = 1, limit = 20) =>
    api.get('/analytics/activity', { params: { page, limit } }),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { displayName?: string; avatar?: string }) =>
    api.patch('/users/profile', data),
  getAll: (page = 1, limit = 20) =>
    api.get('/users/all', { params: { page, limit } }),
};
