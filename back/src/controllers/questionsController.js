import Question from '../models/Question.js';
import QuestionStatistics from '../models/QuestionStatistics.js';

// GET /perguntas/:material_id
export const questions = async (req, res) => {
  try {
    const result = await Question.findAll({
      where: { material_id: req.params.material_id },
      attributes: ['id', 'question', 'type', 'options']
    });

    const formatted = result.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options || null
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
};

// POST /check-answer
export const checkAnswer = async (req, res) => {
    try {
      const { question_id, user_answer, difficulty_level } = req.body;
      const question = await Question.findByPk(question_id);
  
      if (!question) {
        return res.status(404).json({ error: 'Questão não encontrada' });
      }
  
      let isCorrect = false;
      let correctAnswer = null;
      let explanation = null;
  
      if (question.type === 'VERDADEIRO_FALSO') {
        isCorrect = question.is_correct_v_f === user_answer;
        correctAnswer = question.is_correct_v_f;
        explanation = question.explanation || null;
      }
  
      else if (question.type === 'MULTIPLA_ESCOLHA') {
        const correctOpt = question.correct_opt;
        isCorrect = correctOpt === user_answer;
        correctAnswer = correctOpt;
        explanation = question.explanation || null;
      }
  
      else if (question.type === 'EXPLICATIVA') {
        isCorrect = null; // Avaliação manual
        correctAnswer = null;
        explanation = question.explanation || null;
      }
  
      let [stat] = await QuestionStatistics.findOrCreate({
        where: { question_id },
        defaults: {
          total_attempts: 0,
          correct_answers: 0,
          incorrect_answers: 0,
          difficulty_easy: 0,
          difficulty_medium: 0,
          difficulty_hard: 0,
        },
      });
      
      // Atualizações seguras usando increment
      const increments = { total_attempts: 1 };
      
      if (isCorrect === true) {
        increments.correct_answers = 1;
      } else if (isCorrect === false) {
        increments.incorrect_answers = 1;
      }

      if (difficulty_level === 'easy') {
        increments.difficulty_easy = 1;
      } else if (difficulty_level === 'medium') {
        increments.difficulty_medium = 1;
      } else if (difficulty_level === 'hard') {
        increments.difficulty_hard = 1;
      }
      
      await stat.increment(increments);

      res.json({ isCorrect, correctAnswer, explanation });
  
    } catch (error) {
      console.error('Erro ao verificar resposta:', error);
      res.status(500).json({ error: 'Erro ao verificar resposta' });
    }
  };
  
// POST /questions/:id/like
export const likeQuestion = async (req, res) => {
    try {
      const question_id = req.params.id;
  
      const question = await Question.findByPk(question_id);
      if (!question) {
        return res.status(404).json({ error: 'Questão não encontrada' });
      }
  
      await Question.increment('likes', { where: { id: question_id } });
  
      const updatedQuestion = await Question.findByPk(question_id, {
        attributes: ['id', 'likes'],
      });
  
      res.json({
        message: 'Curtida registrada com sucesso!',
        likes: updatedQuestion.likes,
      });
  
    } catch (error) {
      console.error('Erro ao curtir a pergunta:', error);
      res.status(500).json({ error: 'Erro ao curtir a pergunta' });
    }
  };
