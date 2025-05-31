<template>
  <div class="container">
    <h1>Relatório</h1>
    <div v-if="questions.length">
      <div
        v-for="(q, index) in questions"
        :key="q.question_id"
        class="question-box"
      >
        <h3>Pergunta {{ index + 1 }}</h3>
        <p><strong>Enunciado:</strong> {{ q.statement }}</p>
        <p>
          <strong>Acertou?</strong>
          <span :class="q.is_correct ? 'correct' : 'incorrect'">
            {{ q.is_correct ? 'Sim ✅' : 'Não ❌' }}
          </span>
        </p>
      </div>

      <div class="chat-container">
        <h2>Desempenho Geral</h2>
        <div class="chat-container__general">
          
          <Chart type="doughnut" :data="overallChartData" :options="chartOptions" class="w-full md:w-[30rem]" />
        </div>

        <h2>Desempenho por Tipo</h2>
        <div v-if="stats.by_type" class="chat-container__type">
          
          <div v-for="(typeData, type) in stats.by_type" :key="type" class="mt-6">
            <h3>{{ formatType(type) }}</h3>
            <Chart
              type="doughnut"
              :data="getChartData(typeData)"
              :options="chartOptions"
              class="w-full md:w-[25rem]"
            />
          </div>
        </div>
      </div>
    </div>
    <p v-else>Nenhuma pergunta encontrada.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import statistics from '@/services/statisticsService'
import Chart from 'primevue/chart'

const route = useRoute()
const questions = ref([])
const stats = ref({})
const overallChartData = ref({
  labels: ['Acertos', 'Erros'],
  datasets: [
    {
      data: [],
      backgroundColor: ['#10B981', '#EF4444'],
      hoverBackgroundColor: ['#059669', '#DC2626']
    }
  ]
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const total = stats.value.total || 1
          return `${context.label}: ${context.raw} (${((context.raw / total) * 100).toFixed(1)}%)`
        }
      }
    }
  }
}

function getChartData(typeStats) {
  return {
    labels: ['Acertos', 'Erros'],
    datasets: [
      {
        data: [typeStats.correct, typeStats.wrong],
        backgroundColor: ['#10B981', '#EF4444'],
        hoverBackgroundColor: ['#059669', '#DC2626']
      }
    ]
  }
}

function formatType(type) {
  switch (type) {
    case 'MULTIPLA_ESCOLHA':
      return 'Múltipla Escolha'
    case 'VERDADEIRO_FALSO':
      return 'Verdadeiro ou Falso'
    default:
      return type
  }
}

async function fetchQuestions() {
  try {
    const materialId = route.params.id
    const response = await statistics.getUserAnswersByMaterial(materialId)
    questions.value = response.data.question || []
    stats.value = response.data.stats || {}

    // Atualiza gráfico geral
    overallChartData.value.datasets[0].data = [
      stats.value.correct || 0,
      stats.value.wrong || 0
    ]
  } catch (err) {
    console.error('Erro ao carregar perguntas:', err)
  }
}

onMounted(fetchQuestions)
</script>
<style lang="scss">
.question-box {
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
}

.correct {
  color: #10B981;
  font-weight: bold;
}

.incorrect {
  color: #EF4444;
  font-weight: bold;
}

.chat-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 2rem;
}

.chat-container__general {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-container__type {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

.chat-container__type > div {
  width: 300px;
  max-width: 100%;
}
</style>

