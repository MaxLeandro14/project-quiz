<!-- pages/login.vue -->
<template>
    <div class="p-4 max-w-md mx-auto space-y-4">
      <h1 class="text-xl font-bold">Login</h1>
  
      <input v-model="email" type="email" placeholder="Email" class="w-full border p-2 rounded" />
      <input v-model="password" type="password" placeholder="Senha" class="w-full border p-2 rounded" />
      
      <button @click="handleLogin" class="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Entrar
      </button>
  
      <div class="text-center mt-4">Ou</div>
  
      <LoginGoogle />
    </div>
  </template>
  
  <script setup lang="ts">
  import { useAuth } from '~/composables/useAuth'
  import LoginGoogle from '~/components/LoginGoogle.vue'
  
  const { login } = useAuth()
  
  const email = ref('')
  const password = ref('')
  
  async function handleLogin() {
    const success = await login(email.value, password.value)
    if (success) {
      navigateTo('/dashboard')
    }
  }
  </script>
  
  