<template>
  <footer class="footer">
    <div class="container">
      <div class="box-question">
        <Button 
          label="Anterior" 
          raised 
          severity="info" 
          variant="outlined" 
          @click="$emit('prev')"
          :disabled="currentIndex === 0" />
        <Button 
          v-if="isConfirmMode"
          label="Confirmar" 
          raised 
          severity="success" 
          variant="outlined" 
          @click="$emit('confirm')" />
        <Button 
          v-else
          label="Próxima" 
          raised 
          severity="info" 
          variant="outlined" 
          @click="$emit('next')"
          :disabled="currentIndex === totalQuestions - 1" />
      </div>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  currentIndex: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  isConfirmMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['prev', 'next', 'confirm'])
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 15px 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.box-question {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}
</style>