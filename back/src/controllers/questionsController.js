import { Op } from 'sequelize';
import Question from '../models/Question.js';
import QuestionStatistics from '../models/QuestionStatistics.js';
import UserAnswers from '../models/UserAnswers.js';

// GET /perguntas/:material_id
export const questions = async (req, res) => {
  try {
    const user_id = '3cdc152f-b12d-4c67-a552-817e32d56fc7';
      if (!user_id) {
        throw new Error("Usuário não autenticado.");
      }

    const questions = await Question.findAll({
      where: { material_id: req.params.material_id },
      raw: true
    });

    let answersMap = {};
    if (user_id) {
      const answered = await UserAnswers.findAll({
        where: {
          user_id,
          question_id: { [Op.in]: questions.map(q => q.id) }
        },
        attributes: ['question_id', 'choose', 'is_correct'],
        raw: true
      });

      console.log('answered', answered)

      answersMap = Object.fromEntries(
        answered.map(ans => [ans.question_id, { 
          user_answer: ans.choose,
          is_correct: ans.is_correct
        }])
      );
    }

    console.log('answersMap', answersMap)
    console.log('questions', questions)

    const formatted = questions.map(q => {
      const user_answer = answersMap[q.id]?.user_answer || null;
      let isCorrect = null;
      let correctAnswer = null;
      let explanation = q.explanation || null;

      if (q.type === 'VERDADEIRO_FALSO') {
        isCorrect = String(q.is_correct_v_f) === String(user_answer);
        correctAnswer = q.is_correct_v_f;
      } else if (q.type === 'MULTIPLA_ESCOLHA') {
        isCorrect = String(q.correct_opt) === String(user_answer);
        correctAnswer = q.correct_opt;
      }

      return {
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options || null,
        user_answer,
        isCorrect,
        correctAnswer,
        explanation
      };
  });

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
      
      // const user_id = req.user?.id;
      const user_id = '3cdc152f-b12d-4c67-a552-817e32d56fc7';
      if (!user_id) {
        throw new Error("Usuário não autenticado.");
      }
  
      // Verifica se o usuário já respondeu essa pergunta
      const alreadyAnswered = await UserAnswers.findOne({
        where: {
          user_id: user_id,
          question_id: question_id
        }
      });

      if (alreadyAnswered) {
        return res.status(400).json({ error: 'Você já respondeu essa pergunta.' });
      }

      let isCorrect = false;
      let correctAnswer = null;
      let explanation = null;
  
      if (question.type === 'VERDADEIRO_FALSO') {
        console.log('String(question.is_correct_v_f)', String(question.is_correct_v_f))
        console.log('String(user_answer)', String(user_answer))
        isCorrect = String(question.is_correct_v_f) === String(user_answer);
        correctAnswer = question.is_correct_v_f;
        explanation = question.explanation || null;
      } else if (question.type === 'MULTIPLA_ESCOLHA') {
        const correctOpt = question.correct_opt;
        isCorrect = String(correctOpt) === String(user_answer);
        correctAnswer = correctOpt;
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

      await UserAnswers.create({
        user_id: user_id,
        question_id,
        choose: user_answer,
        is_correct: isCorrect
      });

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
