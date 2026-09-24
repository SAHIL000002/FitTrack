import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: attach the stored JWT on every request.
 * Token is read at request time so tab-remote logout / context changes are respected.
 */
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('fit_track_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage may be unavailable in some environments; fail open
  }
  return config;
});

/** Response interceptor: surface 401s as rejections the auth layer can react to. */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid/expired — clear it so further requests don't keep retrying
      try {
        localStorage.removeItem('fit_track_token');
      } catch {
        /* ignore */
      }
    }
    return Promise.reject(error);
  }
);

export default api;

