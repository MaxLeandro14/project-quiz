import Sequelize from 'sequelize';
import QuestionStatistics from '../models/QuestionStatistics.js';
import Question from '../models/Question.js';

// Rota para obter o percentual de acerto de uma questão específica
///GET performance/:questionId
//Objetivo: Retorna o percentual de acertos de uma questão específica.
/*
Resposta de exemplo:
{
  "question_id": "123e4567-e89b-12d3-a456-426614174000",
  "total_attempts": 100,
  "correct_answers": 70,
  "incorrect_answers": 30,
  "accuracy_percentage": 70
} */
export const performance = async (req, res) => {
  try {
    const { questionId } = req.params;

    const questionPerformance = await QuestionStatistics.findOne({
      attributes: [
        'question_id',
        [Sequelize.literal(`(correct_answers * 100.0) / NULLIF(total_attempts, 0)`), 'percentual_acerto'],
      ],
      where: { question_id: questionId },
      raw: true,
    });

    if (!questionPerformance) {
      return res.status(404).json({ message: 'Questão não encontrada' });
    }

    res.json(questionPerformance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter dados de desempenho' });
  }
};

// Rota para obter a média geral de acertos em cima de todas as perguntas do material
//average-performance
//Explicação: Houve 500 tentativas em todas as questões combinadas, com 350 respostas corretas, resultando em uma média geral de 70% de acertos.

export const averagePerformancePorMaterial = async (req, res) => {
    try {
      const { materialId } = req.params;
  
      const resultado = await QuestionStatistics.findOne({
        attributes: [
          [
            Sequelize.literal(`(SUM(correct_answers) * 100.0) / NULLIF(SUM(total_attempts), 0)`),
            'media_geral_acertos'
          ]
        ],
        include: [{
          model: Question,
          attributes: [],
          where: { material_id: materialId }
        }],
        raw: true,
      });
  
      if (!resultado || resultado.media_geral_acertos === null) {
        return res.status(404).json({ message: 'Nenhuma estatística encontrada para este material.' });
      }
  
      res.json({
        material_id: materialId,
        media_geral_acertos: resultado.media_geral_acertos !== null ? parseFloat(parseFloat(resultado.media_geral_acertos).toFixed(2)) : 0
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao calcular a média para este material' });
    }
  };

// Rota para comparar o desempenho de uma questão com a média geral
//compare/:questionId
//Objetivo: Compara o desempenho de uma questão específica com a média geral.
  export const compareQuestPerformance = async (req, res) => {
    try {
      const { questionId } = req.params;
  
      // Passo 1: Buscar o material_id da questão
      const question = await Question.findByPk(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Questão não encontrada' });
      }
  
      const materialId = question.material_id;
  
      // Passo 2: Calcular a média geral de acertos para o material
      const comparison = await QuestionStatistics.findOne({
        attributes: [
          'question_id',
          [
            Sequelize.literal(`(correct_answers * 100.0) / NULLIF(total_attempts, 0)`),
            'percentual_acerto'
          ],
          [
            Sequelize.literal(`(
              (correct_answers * 100.0) / NULLIF(total_attempts, 0)
              - (
                SELECT (SUM(qs.correct_answers) * 100.0) / NULLIF(SUM(qs.total_attempts), 0)
                FROM question_statistics qs
                INNER JOIN questions q ON qs.question_id = q.id
                WHERE q.material_id = '${materialId}'
              )
            )`),
            'diferenca_media_geral'
          ]
        ],
        where: { question_id: questionId },
        raw: true
      });
  
      if (!comparison) {
        return res.status(404).json({ message: 'Estatísticas da questão não encontradas' });
      }
  
      const percentual = parseFloat(comparison.percentual_acerto);
      const diferenca = parseFloat(comparison.diferenca_media_geral);
      const mediaGeral = (percentual - diferenca).toFixed(2);
  
      res.json({
        question_id: comparison.question_id,
        percentual_acerto: percentual.toFixed(2),
        media_geral: mediaGeral,
        diferenca_media_geral: diferenca.toFixed(2),
        desempenho: diferenca > 0 ? 'Acima da média' : 'Abaixo da média'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao comparar desempenho' });
    }
  };  

// Rota para obter o desempenho das questões comparado à média geral
///performance-summary
export const performanceSummary = async (req, res) => {
  try {
    const { materialId } = req.params;

    if (!materialId) {
      return res.status(400).json({ message: 'O parâmetro materialId é obrigatório.' });
    }

    // Buscar estatísticas das questões desse material
    const statistics = await QuestionStatistics.findAll({
      include: [{
        model: Question,
        where: { material_id: materialId },
        attributes: [] // não queremos os dados da questão aqui, só o filtro
      }]
    });

    if (!statistics.length) {
      return res.status(404).json({ message: 'Nenhuma estatística encontrada para este material.' });
    }

    // Calcular a média geral de acertos para o material
    const totalAttempts = statistics.reduce((acc, stat) => acc + stat.total_attempts, 0);
    const totalCorrect = statistics.reduce((acc, stat) => acc + stat.correct_answers, 0);
    const mediaGeral = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

    // Gerar resumo para cada questão
    const summary = statistics.map(stat => {
      const percentualAcerto = stat.total_attempts > 0
        ? (stat.correct_answers / stat.total_attempts) * 100
        : 0;

      const diferencaMediaGeral = percentualAcerto - mediaGeral;

      let message;
      if (percentualAcerto > mediaGeral) {
        message = `Você teve um desempenho acima da média dos usuários.`;
      } else if (percentualAcerto === mediaGeral) {
        message = `Seu desempenho foi igual à média dos usuários.`;
      } else {
        message = `Você teve um desempenho abaixo da média dos usuários.`;
      }

      return {
        question_id: stat.question_id,
        percentual_acerto: `${percentualAcerto.toFixed(2)}%`,
        media_gabarito: `${mediaGeral.toFixed(2)}%`,
        diferenca_media_geral: `${diferencaMediaGeral.toFixed(2)}%`,
        message
      };
    });

    return res.json({ summary });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getTopQuestionsByMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const statistics = await QuestionStatistics.findAll({
      include: [{
        model: Question,
        where: { material_id: materialId },
        attributes: []
      }],
      raw: true
    });

    if (!statistics.length) {
      return res.status(404).json({ message: 'Nenhuma estatística encontrada para este material.' });
    }

    const questoesComAcertos = statistics.map(stat => {
      const percentualAcerto = stat.total_attempts > 0
        ? (stat.correct_answers / stat.total_attempts) * 100
        : 0;

      return {
        question_id: stat.question_id,
        percentual_acerto: percentualAcerto
      };
    });

    const ordenadas = questoesComAcertos.sort((a, b) => b.percentual_acerto - a.percentual_acerto);

    const melhores = ordenadas.slice(0, 3).map(q => ({
      question_id: q.question_id,
      percentual_acerto: `${q.percentual_acerto.toFixed(2)}%`
    }));

    const piores = ordenadas.slice(-3).reverse().map(q => ({
      question_id: q.question_id,
      percentual_acerto: `${q.percentual_acerto.toFixed(2)}%`
    }));

    return res.json({ melhores_questoes: melhores, piores_questoes: piores });
  } catch (error) {
    console.error('Erro ao buscar questões com melhor/pior desempenho:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getMaterialSummary = async (req, res) => {
  try {
    const { materialId } = req.params;

    if (!materialId) {
      return res.status(400).json({ message: 'O parâmetro materialId é obrigatório.' });
    }

    const statistics = await QuestionStatistics.findAll({
      include: [{
        model: Question,
        where: { material_id: materialId },
        attributes: [] // não precisamos retornar os dados das questões
      }],
      raw: true
    });

    if (!statistics.length) {
      return res.status(404).json({ message: 'Nenhuma estatística encontrada para este material.' });
    }

    const totalQuestoes = new Set(statistics.map(stat => stat.question_id)).size;
    const totalTentativas = statistics.reduce((acc, stat) => acc + stat.total_attempts, 0);
    const totalAcertos = statistics.reduce((acc, stat) => acc + stat.correct_answers, 0);
    const mediaAcertosGlobal = totalTentativas > 0
      ? (totalAcertos / totalTentativas) * 100
      : 0;

    return res.json({
      material_id: materialId,
      total_questoes: totalQuestoes,
      total_tentativas: totalTentativas,
      media_acertos_global: `${mediaAcertosGlobal.toFixed(2)}%`
    });
  } catch (error) {
    console.error('Erro ao gerar resumo do material:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
