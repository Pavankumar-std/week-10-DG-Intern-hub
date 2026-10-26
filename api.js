// ---------------------------------------------------------------
// services/api.js - ALL calls to the backend live here (Task 3).
// Components never use axios directly; they call these functions.
// ---------------------------------------------------------------
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Before every request: attach the login token (if we have one)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says "401 not logged in", clear the saved session
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Turns any error into a friendly message string
export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ERR_NETWORK' || !error.response) return 'Cannot reach the server. Is the backend running?';
  return 'Something went wrong. Please try again.';
}

export const authApi = {
  login: (body) => api.post('/auth/login', body),
  register: (body) => api.post('/auth/register', body),
};

export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (body) => api.post('/jobs', body),
  update: (id, body) => api.put(`/jobs/${id}`, body),
  remove: (id) => api.delete(`/jobs/${id}`),
  mine: () => api.get('/jobs/mine'),
  recommended: () => api.get('/jobs/recommended'),
};

export const applicationsApi = {
  apply: (body) => api.post('/applications', body),
  mine: () => api.get('/applications/mine'),
  forJob: (jobId, q = '') => api.get(`/applications/job/${jobId}`, { params: { q } }),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (body) => api.put('/users/profile', body),
  getSaved: () => api.get('/users/saved'),
  toggleSaved: (jobId) => api.post(`/users/saved/${jobId}`),
  list: (role) => api.get('/users', { params: { role } }),
  toggleDisable: (id) => api.put(`/users/${id}/disable`),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const statsApi = { get: () => api.get('/stats') };

export default api;
