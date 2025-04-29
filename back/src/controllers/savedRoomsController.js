import SavedRooms from '../models/SavedRooms.js'
import Room from '../models/Room.js'

// Função para salvar a sala
export const saveRoom = async (req, res) => {
  const { room_id } = req.body;

  const user_id = req.user?.id;
  if (!user_id ||!room_id) {
    return res.status(400).json({ message: 'user_id e room_id são obrigatórios.' });
  }

  try {
    // Verifica se a relação de sala já foi salva
    const existingSavedRoom = await SavedRooms.findOne({
      where: {
        user_id,
        room_id,
      },
    });

    if (existingSavedRoom) {
      return res.status(400).json({ message: 'Esta sala já foi salva por este usuário.' });
    }

    // Cria uma nova entrada de sala salva
    const savedRoom = await SavedRooms.create({
      user_id,
      room_id,
    });

    return res.status(201).json({ message: 'Sala salva com sucesso!', savedRoom });
  } catch (error) {
    console.error('Erro ao salvar sala:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Função para obter salas salvas de um usuário
export const getSavedRooms = async (req, res) => {

   const user_id = req.user?.id;
  if (!user_id) {
    return res.status(400).json({ message: 'Usuário não autenticado.' });
  }

  try {
    // Busca todas as salas salvas pelo usuário
    const savedRooms = await SavedRooms.findAll({
      where: { user_id },
      include: [{ model: Room, attributes: ['id', 'name', 'description'] }],
    });

    if (!savedRooms.length) {
      return res.status(404).json({ message: 'Nenhuma sala salva encontrada.' });
    }

    return res.json({ savedRooms });
  } catch (error) {
    console.error('Erro ao obter salas salvas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Função para remover uma sala salva
export const removeSavedRoom = async (req, res) => {
  const { saved_room_id } = req.params;
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({ 
      success: false,
      message: 'Usuário não autenticado.' 
    });
  }

  if (!saved_room_id) {
    return res.status(400).json({ 
      success: false,
      message: 'ID do registro salvo é obrigatório.' 
    });
  }

  try {
    const savedRoom = await SavedRooms.findOne({
      where: { 
        id: saved_room_id,
        user_id
      }
    });

    if (!savedRoom) {
      return res.status(404).json({ 
        success: false,
        message: 'Registro não encontrado ou você não tem permissão para removê-lo.' 
      });
    }

    await savedRoom.destroy();

    return res.status(200).json({ 
      success: true,
      message: 'Sala removida dos salvos com sucesso!',
      deletedId: saved_room_id
    });

  } catch (error) {
    console.error('Erro ao remover sala salva:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao remover sala salva.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};
