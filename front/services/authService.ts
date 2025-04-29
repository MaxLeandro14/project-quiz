import axios from 'axios'

const BASE_URL = 'http://localhost:3001'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const authService = {
  async register(payload: { email: string; password: string; nome?: string }) {
    const { data } = await api.post('/cadastro', payload)
    return data
  },

  async login(payload: { email: string; password: string }) {
    const { data } = await api.post('/login', payload)
    return data
  },

  async loginWithGoogle(googleToken: string) {
    const { data } = await api.post('/acesso/google', { token: googleToken })
    return data
  },
}
