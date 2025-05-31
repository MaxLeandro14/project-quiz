<template>
  <div class="quiz-container">
    <div class="container-warap">
      <div class="progress-container__header">
        <div class="progress-container">
          <div
            v-for="(q, i) in questions"
            :key="i"
            :class="[
              'progress-step', {
              completed: confirmedAnswers[i] !== null && i !== currentQuestionIndex,
              current: i === currentQuestionIndex,
              pending: confirmedAnswers[i] === null && i !== currentQuestionIndex
            }]"
             v-tooltip.bottom="{
                value: `Questão ${i+1}`,
                pt: {
                  root: { class: 'custom-tooltip' },
                  arrow: { class: 'custom-tooltip-arrow' }
                }
              }"
              @click="goToQuestion(i)"
          ></div>
        </div>

        <div class="progress-container__header__options">
          <div>
            <i class="pi pi-comments" style="font-size: 1rem"></i>
          </div>

          <div>
            <i class="pi pi-chart-line" style="font-size: 1rem"></i>
          </div>
          
          <div>
            <Button type="button" variant="text" icon="pi pi-ellipsis-v" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" />
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
          </div>
        </div>
      </div>
    

      <div v-if="questions.length > 0" class="question-card">

          <div class="question-conteiner">
            <div class="question-conteiner__qt">Pergunta: {{ currentQuestionIndex + 1 }} / {{ questions.length }}</div>
            <div>{{ currentQuestion.question }}</div>
          </div>

          <div class="question-response">
            <!-- Exibe a resposta apenas depois da confirmação -->
            <div v-if="confirmedAnswers[currentQuestionIndex] && formatAnswer(confirmedAnswers[currentQuestionIndex].correctAnswer) !== formatAnswer(confirmedAnswers[currentQuestionIndex]?.selected)" class="answer-display">
              <!-- Feedback da resposta -->
              <div class="answer-feedback">
                <div class="correct-answer">
                  <strong>Resposta correta:</strong> {{ formatAnswer(confirmedAnswers[currentQuestionIndex].correctAnswer) }}
                </div>
                <div v-if="confirmedAnswers[currentQuestionIndex].explanation" class="explanation">
                  <strong>Explicação:</strong>
                  {{ findCorrectAnswer(confirmedAnswers[currentQuestionIndex].correctAnswer) }}
                </div>
              </div>
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
                    selected: confirmedAnswers[currentQuestionIndex]?.selected === option.option,
                    disabled: confirmedAnswers[currentQuestionIndex]
                  }
                ]"
              >
                <span class="option-letter">{{ option.option }}</span> {{ option.text }}
                <span v-if="confirmedAnswers[currentQuestionIndex]?.correctAnswer === option.option" class="check-mark">✓</span>
              </div>
            </div>

            <!-- True/False -->
            <div v-if="currentQuestion.type === 'VERDADEIRO_FALSO'" class="options-container">
              <span 
                @click="!confirmedAnswers[currentQuestionIndex] && selectOption('true')" 
                :class="[
                  'option-button',
                  {
                    active: selectedOption === 'true' && !confirmedAnswers[currentQuestionIndex],
                    selected: confirmedAnswers[currentQuestionIndex]?.selected === 'true',
                    disabled: confirmedAnswers[currentQuestionIndex]
                  }
                ]"
              >
                <span class="option-letter">A</span> Verdadeiro
                <span v-if="String(confirmedAnswers[currentQuestionIndex]?.correctAnswer) === 'true'" class="check-mark">✓</span>
              </span>
              <span 
                @click="!confirmedAnswers[currentQuestionIndex] && selectOption('false')" 
                :class="[
                  'option-button',
                  {
                    active: selectedOption === 'false' && !confirmedAnswers[currentQuestionIndex],
                    selected: confirmedAnswers[currentQuestionIndex]?.selected === 'false',
                    disabled: confirmedAnswers[currentQuestionIndex]
                  }
                ]"
              >
                <span class="option-letter">B</span> Falso
                <span v-if="String(confirmedAnswers[currentQuestionIndex]?.correctAnswer) === 'false'" class="check-mark">✓</span>
              </span>
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
      :allQuestionsAnswered="allQuestionsAnswered"
      @prev="goToPreviousQuestion"
      @next="handleNext"
      @confirm="confirmAnswer"
      @finish="handleFinish"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import questionService from '@/services/questionService'
import FooterQuestion from '@/components/questions/FooterQuestion.vue'

const route = useRoute()
const router = useRouter()

const questions = ref([])
const currentQuestionIndex = ref(0)
const selectedOption = ref("")
const confirmedAnswers = ref([])
const isConfirmMode = ref(false)
const answerFeedback = ref(null);

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length * 100).toFixed(2))

const allQuestionsAnswered = computed(() => {
  return confirmedAnswers.value.every(answer => answer !== null)
})

function handleFinish() {
  const reportId = route.params.id;
  if(!reportId) return;
  router.push(`/questions/report/${reportId}`)
}
const goToQuestion = (index) => {
  if (index === currentQuestionIndex.value) return;
  
  currentQuestionIndex.value = index;
  selectedOption.value = confirmedAnswers.value[index] || "";
  isConfirmMode.value = false;
};

function selectOption(option) {
  selectedOption.value = option
  isConfirmMode.value = true
}

function confirmAnswer() {
  if (selectedOption.value) {
    console.log('selectedOption.value', selectedOption.value)
    confirmedAnswers.value[currentQuestionIndex.value] = selectedOption.value
    isConfirmMode.value = false
    checkAnswer()
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

function findCorrectAnswer(correctAnswer) {
  console.log('correctAnswer', correctAnswer)
   const currentQuestion = confirmedAnswers.value[currentQuestionIndex.value];
    
    if (!currentQuestion || !currentQuestion.explanation) {
        console.log('Questão inválida ou não encontrada')
        return '--';
    }

    if (Array.isArray(currentQuestion.explanation)) {
        const found = currentQuestion.explanation.find(item => item.option === currentQuestion.correctAnswer);
        
        return found ? found.explanation : currentQuestion.explanation[0]?.explanation || 'Explicação não disponível';
    }

    return currentQuestion.explanation || 'Explicação não disponível';
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

    confirmedAnswers.value = response.data.map(item =>
        item.user_answer !== null
          ? { ...item, selected: item.user_answer }
          : null
      );
    selectedOption.value = confirmedAnswers.value[0] || "";

    console.log('confirmedAnswers', confirmedAnswers)
    console.log('selectedOption', selectedOption.value)
  } catch (err) {
    console.error('Erro ao carregar perguntas:', err)
  }
}

async function checkAnswer() {
  try {
    const currentQ = currentQuestion.value;
    console.log('currentQ', currentQ);
    const params = {
        "question_id": currentQ.id,
        "user_answer": confirmedAnswers.value[currentQuestionIndex.value]
      }
    const response = await questionService.checkAnswer(params)
    console.log('response',response.data)
    confirmedAnswers.value[currentQuestionIndex.value] = {selected: selectedOption.value, ...response.data}

    console.log('confirmedAnswers.value', confirmedAnswers.value)
    
    return;

  } catch (err) {
    console.error('Erro ao buscar resposta', err)
  }
}

/* menu more options*/
const menu = ref();
const items = ref([
    {
        label: 'Options',
        items: [
            {
                label: 'Refresh',
                icon: 'pi pi-refresh'
            },
            {
                label: 'Export',
                icon: 'pi pi-upload'
            }
        ]
    }
]);

const toggle = (event) => {
    menu.value.toggle(event);
};
/*  */
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
  display: flex;
  gap: 15px;

  .question-conteiner {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  flex: 1;

  .question-conteiner__qt {
    font-size: 0.9rem;
    color: #ef4141;
    margin-bottom: 11px;
  }
}

  .question-response {
    flex: 1;
}
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
  margin-top: 15px;
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

.check-mark {
  color: #508f45;
}

.restart-button {
  margin-top: 1rem;
}

.progress-container__header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    gap: 5px;
    border-radius: 7px;
    border: 1px solid #f7f4f4;
    padding: 5px;
    margin-top: 10px;
}
.progress-container {
  display: flex;
  gap: 6px;
  padding: 10px;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.progress-step {
  flex: 1;
  height: 10px;
  background-color: #ddd;
  border-radius: 8px;
  transition: all 0.3s ease;
  max-width: 16px;
  background-color: #ccc; // cinza por padrão
  transition: background-color 0.3s;
  cursor: pointer;
}

/* Passo concluído */
.progress-step.completed {
  background-color: #f1c40f;
}

.progress-step.pending {
  background-color: #ccc; // cinza
}

.progress-container__header__options {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
}

.custom-tooltip {
  background: white !important;
  color: black !important;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.answer-feedback {
    margin-bottom: 12px;
}

/* Passo atual */
.progress-step.current {
  background: #ffce00;
}

@media (min-width: 768px) {
  .option-letter{
      height: 25px;
      line-height: 23px;
      min-width: 25px;
      width: 25px;
  }
}

@media (min-width: 874px) {
  .question-card{
      min-height: 400px;
  }
}

@media (max-width: 874px) {
  .question-card{
      flex-direction: column;
  }
}

@media (max-width: 500px) {
  .question-card {
    margin-top: 22px;
  }
  .progress-container__header__options{
    width: 100%;
    justify-content: flex-end;
  }
  .progress-container{
    display: none !important;
  }
}
</style>
  