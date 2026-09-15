import axios from 'axios';

const backendUrl =
  localStorage.getItem('backend_url') || 'http://localhost:3000';

const apiBaseUrl = `${backendUrl}/api`;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT to authenticated requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Automatically sync the base URL if settings change
export const updateClientBaseURL = (url: string) => {
  const normalizedUrl = url.replace(/\/+$/, '');

  apiClient.defaults.baseURL = normalizedUrl.endsWith('/api')
    ? normalizedUrl
    : `${normalizedUrl}/api`;
};

export default apiClient;