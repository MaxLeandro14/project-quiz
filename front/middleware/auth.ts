export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('token') // ou useLocalStorage/useSessionStorage com @vueuse
    if (!token.value) {
      return navigateTo('/login')
    }
  })
  