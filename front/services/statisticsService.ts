import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  getUserAnswersByMaterial(materialId:string) {
    return api.get(`/report/${materialId}`);
  }
};