<template>
  <div class="quiz-container">
    <div class="container-warap">
      
      <div class="question-card__header">
        <Button icon="pi pi-heart" severity="help" variant="text" rounded aria-label="Favorite" />
        <Button icon="pi pi-heart" severity="help" variant="text" rounded aria-label="Favorite" />
        <Button icon="pi pi-heart" severity="help" variant="text" rounded aria-label="Favorite" />
      </div>

      <div v-if="questions.length > 0" class="question-card">
      <!--<div class="progress">
        Progresso: {{ currentQuestionIndex + 1 }} / {{ questions.length }}
      </div>-->
      

      <div class="question-text">{{ currentQuestion.question }}</div>

      <!-- Exibe a resposta apenas depois da confirmação -->
      <div v-if="confirmedAnswers[currentQuestionIndex]" class="answer-display">
        <strong>Sua resposta:</strong> {{ formatAnswer(confirmedAnswers[currentQuestionIndex]) }}
      </div>

      <!-- Multiple Choice -->
      <div v-if="currentQuestion.type === 'MULTIPLA_ESCOLHA'" class="options-container">
        <div 
          v-for="option in currentQuestion.options" 
          :key="option.option"
          @click="!confirmedAnswers[currentQuestionIndex] && selectOption(option.option)"
          :class="[
            'option-button', 
            { 
              active: selectedOption === option.option && !confirmedAnswers[currentQuestionIndex],
              selected: confirmedAnswers[currentQuestionIndex] === option.option,
              disabled: confirmedAnswers[currentQuestionIndex]
            }
          ]"
        >
          <span class="option-letter">{{ option.option }}</span> {{ option.text }}
          <span v-if="confirmedAnswers[currentQuestionIndex] === option.option" class="check-mark">✓</span>
        </div>
      </div>

      <!-- True/False -->
      <div v-if="currentQuestion.type === 'VERDADEIRO_FALSO'" class="options-container">
        <button 
          @click="!confirmedAnswers[currentQuestionIndex] && selectOption('true')" 
          :class="[
            'option-button',
            {
              active: selectedOption === 'true' && !confirmedAnswers[currentQuestionIndex],
              selected: confirmedAnswers[currentQuestionIndex] === 'true',
              disabled: confirmedAnswers[currentQuestionIndex]
            }
          ]"
        >
          Verdadeiro
          <span v-if="confirmedAnswers[currentQuestionIndex] === 'true'" class="check-mark">✓</span>
        </button>
        <button 
          @click="!confirmedAnswers[currentQuestionIndex] && selectOption('false')" 
          :class="[
            'option-button',
            {
              active: selectedOption === 'false' && !confirmedAnswers[currentQuestionIndex],
              selected: confirmedAnswers[currentQuestionIndex] === 'false',
              disabled: confirmedAnswers[currentQuestionIndex]
            }
          ]"
        >
          Falso
          <span v-if="confirmedAnswers[currentQuestionIndex] === 'false'" class="check-mark">✓</span>
        </button>
      </div>

      <!-- Explicativa -->
      <div v-if="currentQuestion.type === 'EXPLICATIVA'" class="explanatory-container">
        <textarea 
          v-model="selectedOption.value" 
          placeholder="Digite sua resposta aqui..."
          class="answer-textarea"
          :disabled="confirmedAnswers[currentQuestionIndex]"
        ></textarea>
      </div>
      </div>

      <div class="question-card__like">
        <div class="question-card__like__container">
          <div>
            <i class="pi pi-thumbs-up positive" style="font-size: 1.5rem"></i>
          </div>
          <div>
            <i class="pi pi-thumbs-down negative" style="font-size: 1.5rem"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <FooterQuestion 
      :currentIndex="currentQuestionIndex" 
      :totalQuestions="questions.length"
      :isConfirmMode="isConfirmMode"
      @prev="goToPreviousQuestion"
      @next="handleNext"
      @confirm="confirmAnswer"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { questionService } from '@/services/questionService'
import FooterQuestion from '@/components/questions/FooterQuestion.vue'

const route = useRoute()

const questions = ref([])
const currentQuestionIndex = ref(0)
const selectedOption = ref("")
const confirmedAnswers = ref([])
const isConfirmMode = ref(false)

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

function selectOption(option) {
  selectedOption.value = option
  isConfirmMode.value = true
}

function confirmAnswer() {
  if (selectedOption.value) {
    confirmedAnswers.value[currentQuestionIndex.value] = selectedOption.value
    isConfirmMode.value = false
  }
}

function handleNext() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    selectedOption.value = confirmedAnswers.value[currentQuestionIndex.value] || ""
    isConfirmMode.value = false
  }
}

function goToPreviousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedOption.value = confirmedAnswers.value[currentQuestionIndex.value] || ""
    isConfirmMode.value = false
  }
}

function formatAnswer(answer) {
  if (currentQuestion.value.type === 'VERDADEIRO_FALSO') {
    return answer === 'true' ? 'Verdadeiro' : 'Falso'
  }
  return answer
}

async function fetchQuestions() {
  try {
    const materialId = route.params.id
    const response = await questionService.getQuestionsByMaterialId(materialId)
    questions.value = response.data
    confirmedAnswers.value = new Array(response.data.length).fill(null)
  } catch (err) {
    console.error('Erro ao carregar perguntas:', err)
  }
}

onMounted(fetchQuestions)
</script>

<style lang="scss" scoped>
.container-warap {
    margin: 0 auto;
    max-width: 1200px;
    padding: 0 16px;
    position: relative;
    width: 100%;
}
.quiz-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 73px);
  overflow: auto;
}

.question-card {
  flex-grow: 1;
  background: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 56px;
  overflow-y: auto;
}

.question-text {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.progress {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  color: #7f8c8d;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@keyframes smoothSelect {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(238, 133, 35, 0.0);
    background-color: transparent;
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 10px 3px rgba(238, 133, 35, 0.3);
    background-color: rgba(238, 133, 35, 0.05);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(238, 133, 35, 0.0);
    background-color: rgba(238, 133, 35, 0.1);
  }
}

.option-button {
  padding: 1rem;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  text-align: left;
  transition: all 0.3s ease;
  display: flex;
  gap: 20px;
  transition: background 0.3s ease, color 0.3s ease;
  
  &:not(.disabled):hover .option-letter, &.active .option-letter {
    background: #ee8523;
    color: #ffffff;
  }

  &.active {
    background: rgba(238, 133, 35, 0.1);
    animation: smoothSelect 0.6s ease-out;
  }
   &.selected {
    background: rgba(238, 133, 35, 0.1);
  }
}

.option-letter {
  display: flex;
  height: 25px;
  line-height: 23px;
  min-width: 25px;
  width: 25px;
  background: transparent;
  text-transform: uppercase;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  color: #ee8523;
  border: 1px solid #ee8523;
  transition: background 0.3s ease, color 0.3s ease;
}

.explanatory-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-textarea {
  min-height: 150px;
  padding: 1rem;
  border: 2px solid #3498db;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
}

.submit-button, .restart-button {
  padding: 1rem 2rem;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #27ae60;
  }
}

.question-card__like {
  display: flex;
  justify-content: center;
  padding: 33px 10px;
  margin-bottom: 73px;

  .question-card__like__container{
    display: flex;
    gap: 30px;
    justify-content: center;
    background-color: rgb(245, 252, 248);
    padding: 10px;
    border-radius: 10px;
    min-width: 400px;
    color: rgb(105, 106, 105);
    border: 1px solid #ede9e9;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  i {
    cursor: pointer;
    transition: color 0.3s ease, transform 0.2s ease;
    font-size: 2rem;

    &:hover.positive{
      color: #42b46e;
    }
    &:hover.negative{
      color: #e4582e;
    }

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      animation: pop 0.4s ease forwards;
    }
  }
}

/* Animação de "pop" ao clicar */
@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

.results-container {
  text-align: center;
  background: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.score-text {
  font-size: 1.2rem;
  margin: 1.5rem 0;
}

.restart-button {
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .option-letter{
      height: 25px;
      line-height: 23px;
      min-width: 25px;
      width: 25px;
  }
}

</style>
  