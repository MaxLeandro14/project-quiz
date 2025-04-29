<template>
    <div>
      <div class="questions-btn__container">
        <span 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['questions-btn', { active: activeTab === tab.id }]"  
          @click="setTab(tab.id)"
        >
          {{ tab.label }}
        </span>
      </div>
  
      <div class="questions-box">
        <transition name="fade" mode="out-in">
          <component :is="activeComponent" :key="activeTab" />
        </transition>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import QuestionDocument from '@/components/questions/QuestionDocument.vue'
  import QuestionLink from '@/components/questions/QuestionLink.vue'
  import QuestionYoutube from '@/components/questions/QuestionYoutube.vue'
  
  const tabs = [
    { id: 'documento', label: 'Documento', component: QuestionDocument },
    { id: 'link', label: 'Link', component: QuestionLink },
    { id: 'youtube', label: 'Youtube', component: QuestionYoutube }
  ]
  
  const activeTab = ref('documento')
  
  const setTab = (tabName) => {
    activeTab.value = tabName
  }
  
  const activeComponent = computed(() => {
    return tabs.find(tab => tab.id === activeTab.value)?.component
  })
  </script>
  
  <style scoped>
  .questions-btn__container {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }
  
  .questions-btn {
    padding: 6px;
    border-radius: 5px;
    background: transparent;
    align-items: center;
    border: 1px solid #ff0075;
    border-radius: 8px;
    display: inline-flex;
    font-weight: 600;
    height: 44px;
    justify-content: center;
    line-height: 44px;
    padding: 0 16px;
    position: relative;
    user-select: none;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    transform: scale(1);
    color: inherit;
  }
  
  .questions-btn.active {
    background-color: #ff0075;
    color: #ffffff;
  }
  
  .questions-btn:hover {
    background-color: #ff0075;
    color: #ffffff;
    transform: scale(1.02);
  }
  
  .questions-box {
    width: 50%;
    margin: 0 auto;
  }
  
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  
  @media (max-width: 768px) {
    .questions-box {
      width: 100%;
    }
  }
  </style>
  