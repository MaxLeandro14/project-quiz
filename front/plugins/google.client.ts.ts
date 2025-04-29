import { defineNuxtPlugin } from '#app'
import GoogleLogin from 'vue3-google-login'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(GoogleLogin, {
    clientId: 'SEU_GOOGLE_CLIENT_ID'
  })
})
