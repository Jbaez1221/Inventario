import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://192.168.25.39:4002/api', 
});

export default instance;
