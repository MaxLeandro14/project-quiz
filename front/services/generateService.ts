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

export const generateService = {
  async fromYoutube(url: string) {
    const { data } = await api.post('/generate/youtube', { url });
    return data;
  },

  async fromLink(url: string) {
    const { data } = await api.post('/generate/link', { url });
    return data;
  },

  async fromDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/generate/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return data;
  }
};
