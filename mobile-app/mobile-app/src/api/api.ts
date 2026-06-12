import axios from 'axios';

const API = axios.create({
  baseURL: 'http://172.24.89.33:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
