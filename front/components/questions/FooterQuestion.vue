<template>
  <footer class="footer">
    <div class="container">
      <div class="box-question">
        <div class="box-question_prev" :class="{ 'disabled': currentIndex === 0 }" @click="$emit('prev')">
          <i class="pi pi-arrow-left" style="color: slateblue"></i>
          <span 
          >Anterior</span>
        </div>
        
          <div>
            <div v-if="allQuestionsAnswered">
            <span 
              class="box-question_finish"
              @click="$emit('finish')">
              <span>Finalizar</span>
              <i class="pi pi-check"></i>
            </span>
          </div>

            <div v-if="isConfirmMode">
              <span 
                class="box-question_confir"
                @click="$emit('confirm')">
                <span>Confirmar</span>
                <i class="pi pi-check"></i>
              </span>
            </div>
            <div v-else class="box-question_next" :class="{ 'disabled': currentIndex === totalQuestions - 1 }"  @click="$emit('next')">
                <span>Próxima</span>
                <i class="pi pi-arrow-right" style="color: slateblue"></i>
              </div>
              
          </div>
       
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
  },
  allQuestionsAnswered: {
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
.box-question_confir{
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f3f3;
  padding: 6px 15px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid #37971f;
}

.box-question_confir:hover{
  background: #37971f;
  color: #ffffff;
}

.box-question_prev, .box-question_next {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f3f3;
  padding: 6px 15px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid #ede9e9;
  transition: background-color 0.3s, transform 0.2s ease-in-out, box-shadow 0.3s ease;
}

.box-question_prev:not(.disabled):hover, .box-question_next:not(.disabled):hover {
  background-color: #e1e1e1; /* Tom mais escuro para o fundo */
  transform: scale(1.05); /* Leve aumento de tamanho */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra suave */
  border-color: #b3b3b3; /* Borda mais escura */
}

/* Efeito de foco (quando clicado) */
.box-question_prev:active, .box-question_next:active {
  transform: scale(0.98); /* Leve redução de tamanho */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra mais forte */
}

.box-question_prev.disabled, .box-question_next.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: #e0e0e0;
}
</style>