import axios from 'axios';

const TOKEN_KEY = 'leadflow_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || 'unknown';
    const errorData = error.response?.data || error.message;

    if (import.meta.env.DEV) {
      console.error(`API Error ${status} on ${url}:`, errorData);
    }

    if (status === 401) {
      removeToken();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    } else if (status === 404) {
      window.dispatchEvent(new CustomEvent('api:not-found'));
    } else if (status && status >= 500) {
      window.dispatchEvent(new CustomEvent('api:server-error'));
    }

    return Promise.reject(error);
  }
);

export default api;
export const apiClient = api;
