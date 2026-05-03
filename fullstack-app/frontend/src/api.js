import axios from 'axios';

// In production, the frontend talks to backend through nginx reverse proxy at /api
// In development, it talks directly to the backend on port 5000
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

export const taskApi = {
  getAll: () => api.get('/api/tasks').then((r) => r.data),
  create: (title) =>
    api.post('/api/tasks', { title }).then((r) => r.data),
  update: (id, updates) =>
    api.put(`/api/tasks/${id}`, updates).then((r) => r.data),
  delete: (id) =>
    api.delete(`/api/tasks/${id}`).then((r) => r.data),
  health: () => api.get('/health').then((r) => r.data),
};

export default api;
