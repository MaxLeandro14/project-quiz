<template>
    <footer class="footer">
      <button class="menu-toggle">☰</button>
    </footer>
  </template>
  
  <script setup>
  // Lógica do footer pode ser adicionada aqui
  </script>
  
  <style scoped>
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background-color: white;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: center;
  }
  
  .menu-toggle {
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }
  </style>