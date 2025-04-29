import Question from '../models/Question.js';
import QuestionComments from '../models/QuestionComments.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Material from '../models/Material.js';

export const commentQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { comment, parent_comment_id } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }
    if (!question_id) {
      return res.status(400).json({ message: "ID da questão não fornecido." });
    }
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: "Comentário não pode ser vazio." });
    }

    // Verifica se o comentário pai existe (se foi fornecido um parent_comment_id)
    if (parent_comment_id) {
      const parentComment = await QuestionComments.findByPk(parent_comment_id);
      if (!parentComment) {
        return res.status(404).json({ message: "Comentário pai não encontrado." });
      }
      
      // Verifica se o comentário pai pertence à mesma questão
      if (parentComment.question_id !== question_id) {
        return res.status(400).json({ 
          message: "O comentário pai não pertence a esta questão." 
        });
      }
    }

    // Busca a questão com material e sala
    const response = await Question.findByPk(question_id, {
      include: [{
        model: Material,
        include: [{
          model: Room,
          attributes: ['id', 'allow_comments']
        }]
      }]
    });

    if (!response) {
      return res.status(404).json({ message: "Questão não encontrada." });
    }

    if (!response.Material?.room_id) {
      return res.status(403).json({ 
        message: "Esta questão não está associada a uma sala.",
        allow_comments: false
      });
    }

    const allowComments = response.Material?.Room?.allow_comments ?? false;

    if (!allowComments) {
      return res.status(403).json({ 
        message: "Comentários não permitidos para esta questão.",
        allow_comments: false
      });
    }

    const newComment = await QuestionComments.create({
      question_id,
      user_id,
      comment,
      parent_comment_id: parent_comment_id || null
    });

    return res.status(201).json({ 
      message: "Comentário criado com sucesso.", 
      comment: newComment,
      allow_comments: true
    });
  } catch (error) {
    console.error('Error in commentQuestion:', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      message: "Erro ao criar comentário.", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// DELETE /comments/:comment_id
export const deleteCommentQuestion = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Usuário não autenticado." 
      });
    }

    const comment = await QuestionComments.findByPk(comment_id);

    console.log('comment', comment)
    console.log('comment.user_id', comment.user_id)
    console.log('user_id', user_id)

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: "Comentário não encontrado." 
      });
    }

    // Verifica APENAS se o usuário é dono do comentário
    if (comment.user_id !== user_id) {
      return res.status(403).json({ 
        success: false,
        message: "Você só pode excluir seus próprios comentários." 
      });
    }

    await comment.destroy();

    return res.status(200).json({ 
      success: true,
      message: "Comentário excluído com sucesso.",
      deletedCommentId: comment_id
    });

  } catch (error) {
    console.error('Error deleting comment:', error.message);
    return res.status(500).json({ 
      success: false,
      message: "Erro ao excluir comentário.",
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Buscar comentários de uma pergunta
export const getCommentsQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!question_id) {
      return res.status(404).json({ message: "Id obrigatorio." });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber)) {
      return res.status(400).json({ 
        success: false,
        message: "O parâmetro 'page' deve ser um número." 
      });
    }


    const question = await Question.findByPk(question_id, {
      include: [{
        model: Material,
        include: [{
          model: Room,
          attributes: ['allow_comments']
        }]
      }]
    });

    if (!question) {
      return res.status(404).json({ success: false, message: "Pergunta não encontrada." });
    }

    if (!question.Material?.Room?.allow_comments) {
      return res.status(403).json({ 
        success: false,
        message: "Comentários não permitidos nesta pergunta." 
      });
    }

    // Calcula o offset para paginação
    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows: comments } = await QuestionComments.findAndCountAll({
      where: { 
        question_id,
        parent_comment_id: null
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'url_avatar']
        },
        {
          model: QuestionComments,
          as: 'replies',
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'url_avatar']
            }
          ],
          order: [['created_at', 'ASC']]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limitNumber,
      offset: offset,
      distinct: true // Importante para contar corretamente com includes
    });

    const totalPages = Math.ceil(count / limitNumber);

    return res.status(200).json({ 
      success: true,
      comments,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro ao buscar comentários.",
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Retorna os comentários de um usuário feitos em todas as perguntas (com paginação)
export const getUserComments = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    if (!user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Usuário não autenticado." 
      });
    }

    // Validação dos parâmetros de paginação
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    if (isNaN(pageNumber)) {
      return res.status(400).json({ 
        success: false,
        message: "O parâmetro 'page' deve ser um número." 
      });
    }

    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows: comments } = await QuestionComments.findAndCountAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
      limit: limitNumber,
      offset: offset,
      include: [{
        model: Question,
        attributes: ["id", "question"],
        required: false
      }],
      distinct: true
    });

    // Verifica se existem comentários
    if (count === 0) {
      return res.status(200).json({ 
        success: true,
        message: "Nenhum comentário encontrado para este usuário.",
        comments: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: pageNumber,
          itemsPerPage: limitNumber
        }
      });
    }

    const totalPages = Math.ceil(count / limitNumber);

    return res.status(200).json({
      success: true,
      comments: comments.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        questionId: comment.question_id,
        questionText: comment.Question?.question || "Pergunta não disponível", // Fallback seguro
        createdAt: comment.created_at
      })),
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1
      }
    });

  } catch (error) {
    console.error('Error in getUserComments:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro ao buscar comentários.",
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};
