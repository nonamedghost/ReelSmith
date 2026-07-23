import axios from 'axios';

const backendUrl = localStorage.getItem('backend_url') || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically sync the baseURL if settings update
export const updateClientBaseURL = (url: string) => {
  apiClient.defaults.baseURL = url;
};

export default apiClient;
