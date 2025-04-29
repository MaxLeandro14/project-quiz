import Room from '../models/Room.js'
import Materials from '../models/Material.js'
import crypto from 'node:crypto'
import { Op } from 'sequelize';

export const createRoom = async (req, res) => {
  const { name, description, isPrivate, password, materialId } = req.body;

  try {
    const user_id = req.user?.id;
    if (!user_id || !materialId) {
        throw new Error("Falha ao criar a sala.");
    }

    const material = await Materials.findByPk(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material não encontrado.' });
    }

    if (material.room_id) {
      return res.status(409).json({ message: 'Uma sala já foi criada para este material.' });
    }

    const cod_sala = await generateUniqueCode();

    console.log('user_id', user_id)

    const room = await Room.create({
      owner_id: user_id,
      name,
      codigo: cod_sala,
      description,
      isPrivate,
      password,
      created_at: new Date(),
      updated_at: new Date()
    });

    await Materials.update(
      { room_id: room.id,
        is_room_created: true
       },
      { where: { id: materialId } }
    );

    res.status(201).json({ message: 'Sala criada com sucesso', room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error ao criar a sala', error });
  }
};

export const deleteRoom = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user?.id;
  
    if (!user_id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
  
    try {

      const room = await Room.findByPk(id);
  
      if (!room) {
        return res.status(404).json({ message: 'Sala não encontrada' });
      }
  
      // Verificar se o usuário é o proprietário da sala
      if (room.owner_id !== user_id) {
        return res.status(403).json({ message: 'Você não tem permissão para excluir esta sala' });
      }
  
      await room.destroy();
  
      return res.status(200).json({ message: 'Sala excluída com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao excluir sala', error: error.message });
    }
  };

export const editRoom = async (req, res) => {
    const { room_id } = req.params;
    const { name, description, isPrivate, isAtivo, password, allow_file_uploads, allow_comments } = req.body;

    try {
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }

        // Verificar se a sala existe e se o usuário é o proprietário
        const room = await Room.findOne({ where: { id: room_id, owner_id: user_id } });

        if (!room) {
            return res.status(404).json({ message: 'Sala não encontrada ou você não é o proprietário da sala' });
        }

        if (room.isBanned) {
          return res.status(404).json({ message: "Sala está suspensa." });
        }

        // Atualizar os dados da sala
        room.name = name ?? room.name;
        room.description = description ?? room.description;
        room.is_private = typeof isPrivate === 'boolean' ? isPrivate : room.is_private;
        room.is_ativo = typeof isAtivo === 'boolean' ? isAtivo : room.is_ativo;
        room.allow_file_uploads = typeof allow_file_uploads === 'boolean' ? allow_file_uploads : room.allow_file_uploads;
        room.allow_comments = typeof allow_comments === 'boolean' ? allow_comments : room.allow_comments;
        room.password = password ?? room.password;

        await room.save();

        return res.status(200).json({
            message: 'Sala editada com sucesso',
            room: {
                id: room.id,
                name: room.name,
                description: room.description,
                isPrivate: room.is_private
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao editar sala', error: error.message });
    }
};

export const generateNewRoomCode = async (req, res) => {
    const { room_id } = req.params;

    const user_id = req.user?.id;
    if (!user_id) {
      throw new Error("Usuário não autenticado.");
    }
  
    // Verificar se o usuário está tentando modificar a sala que ele é o proprietário
    try {
      const room = await Room.findOne({ where: { id: room_id, owner_id: user_id } });
  
      if (!room) {
        return res.status(404).json({ message: 'Sala não encontrada ou você não é o proprietário da sala' });
      }
  
      const cod_sala = await generateUniqueCode();
      room.codigo = cod_sala;

      await room.save();
  
      return res.status(200).json({ codSala: cod_sala });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao gerar o código da sala', error });
    }
  };

export const getRoomDetails = async (req, res) => {
    const { room_id } = req.params;
  
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }

      const room = await Room.findByPk(room_id);
      if (!room) {
        return res.status(404).json({ message: "Sala não encontrada." });
      }

      if (room.isBanned) {
        return res.status(404).json({ message: "Sala está banida." });
    }
  
      const isOwner = room.owner_id === user_id;

      return res.status(200).json({
        room: {
          id: room.id,
          name: room.name,
          description: room.description,
          isPrivate: room.isPrivate,
          isAtivo: room.isAtivo,
          codigo: room.codigo,
          allow_file_uploads: room.allow_file_uploads,
          isOwner
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao obter os dados da sala", error: error.message });
    }
  };

// obter as salas do usuário logado
export const getUserRooms = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }

        const rooms = await Room.findAll({ where: { owner_id: user_id } });

        return res.status(200).json({ rooms });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar salas', error: error.message });
    }
};

export const getRoomsAll = async (req, res) => {
  try {
    const { page = 1, search = '', password } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    console.log('search', search)
    console.log('password', password)

    const passwordFilter = password === 'true' ? true : password === 'false' ? false : undefined;

    const where = {
      is_ativo: true,
      is_private: false,
      is_banned: false
    };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (passwordFilter !== undefined) {
      where.password = passwordFilter ? { [Op.ne]: null } : null;
    }

    const { count, rows: rooms } = await Room.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      rooms
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar salas.", error: error.message });
  }
};

export const getRoomByCode = async (req, res) => {
  const { codigo } = req.params;

  try {
      const room = await Room.findOne({ where: { codigo } });

      if (!room || !codigo) {
          return res.status(404).json({ message: "Sala não encontrada." });
      }

      // Verificar se a sala está banida
      if (room.is_banned) {
          return res.status(404).json({ message: "Sala está suspensa." });
      }

      return res.status(200).json({
          room: {
              id: room.id,
              name: room.name,
              description: room.description,
              isPrivate: room.is_private,
              isAtivo: room.is_ativo,
              codigo: room.codigo,
              allow_file_uploads: room.allow_file_uploads
          }
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao obter os dados da sala", error: error.message });
  }
};

const generateUniqueCode = async () => {
    let codigo = '';
  
    while (true) {
      codigo = crypto.randomBytes(2).toString('HEX').toLowerCase();
  
      const roomCount = await Room.count({
        where: { codigo }
      });
  
      if (roomCount === 0) break;
    }
  
    return codigo;
};
