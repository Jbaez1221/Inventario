import axios from 'axios';

export const API_URL = 'http://192.168.1.16:4002';

const axiosBackend = axios.create({
  baseURL: `${API_URL}/api`
});

axiosBackend.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosBackend;
