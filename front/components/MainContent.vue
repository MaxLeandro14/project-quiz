<template>
    <main class="container-question">
      <section class="container">
        <div class="container-question__title">
          <h1>Forneça seu conteúdo e receba <br> perguntas geradas automaticamente.</h1>
        </div>
        
        <QuestionTabs />
      </section>
    </main>
  </template>
  
  <script setup>
  import QuestionTabs from '@/components/questions/QuestionTabs.vue'
  </script>
  
  <style scoped>
  .container-question__title h1 {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: #333;
  }
  </style>
  