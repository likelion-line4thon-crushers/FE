import axios from 'axios';
import { createLogger } from '../utils/logger';

const log = createLogger('api');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    log.error('request interceptor failed', error);
    return Promise.reject(error);
  },
);

export default api;
