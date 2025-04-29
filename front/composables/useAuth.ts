
import { useLocalStorage } from '@vueuse/core'
import { authService } from '~/services/authService'

const token = useLocalStorage<string | null>('auth_token', null)
const user = useLocalStorage<any>('auth_user', null)

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string) {
    try {
      const res = await authService.login({ email, password })
      token.value = res.data.token
      user.value = res.data.user
      return true
    } catch (e) {
      console.error('Erro no login', e)
      return false
    }
  }

  async function loginWithGoogle(googleToken: string) {
    try {
      const res = await authService.loginWithGoogle(googleToken)
      token.value = res.data.token
      user.value = res.data.user
      return true
    } catch (e) {
      console.error('Erro no login com Google', e)
      return false
    }
  }

  async function register(email: string, password: string, nome?: string) {
    try {
      const res = await authService.register({ email, password, nome })
      token.value = res.data.token
      user.value = res.data.user
      return true
    } catch (e) {
      console.error('Erro no registro', e)
      return false
    }
  }

  function logout() {
    token.value = null
    user.value = null
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout
  }
}
