<template>
    <GoogleLogin
      :callback="handleLogin"
      prompt
    />
  </template>
  
  <script setup lang="ts">
  import { useAuth } from '~/composables/useAuth'
  
  const { loginWithGoogle } = useAuth()
  
  async function handleLogin(response: any) {
    const token = response.credential
    if (token) {
      const ok = await loginWithGoogle(token)
      if (ok) navigateTo('/dashboard')
    }
  }
  </script>
  
  