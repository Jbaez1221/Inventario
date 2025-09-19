import axios from 'axios';

<<<<<<< HEAD
export const API_URL = 'http://192.168.25.39:4002';
=======
export const API_URL = 'http://192.168.25.162:4004';
>>>>>>> origin/modegame

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

<<<<<<< HEAD
export default axiosBackend;
=======
export default axiosBackend;
>>>>>>> origin/modegame
