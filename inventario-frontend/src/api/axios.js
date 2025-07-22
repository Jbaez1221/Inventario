import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:4002/api',
});

export default instance;
