import User from '../models/User.js';
import RoomMaterial from '../models/Material.js';
import Room from '../models/Room.js';

// Rota para obter todos os materiais de uma sala com dados do usuário
export const getRoomMaterials = async (req, res) => {
  const { room_id } = req.params;
  const user_id = req.user.id;  // Supondo que o user_id esteja no token do usuário logado (req.user.id)

  try {

    const materials = await RoomMaterial.findAll({
      where: { room_id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'url_avatar'],
        },
      ],
    });

    if (materials.length === 0) {
      return res.status(404).json({ message: 'Nenhum material encontrado para esta sala.' });
    }

    const materialsData = materials.map((material) => ({
      id: material.id,
      type: material.type,
      file_url: material.file_url,
      transcript_text: material.transcript_text,
      url: material.url,
      title: material.title,
      description: material.description,
      created_at: material.created_at,
      updated_at: material.updated_at,
      user: {
        name: material.User.name,
        url_avatar: material.User.url_avatar,
      },
      isCreator: material.user_id === user_id,
    }));

    return res.status(200).json({ materials: materialsData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao obter materiais', error: error.message });
  }
};

// Rota para excluir material
export const deleteMaterial = async (req, res) => {
  const { room_id, material_id } = req.params;

  const userId = req.user?.id;
  if (!userId) {
      throw new Error("Usuário não autenticado.");
  }

  try {
    // Buscar o material a ser excluído
    const material = await RoomMaterial.findOne({
      where: { id: material_id, room_id },
      include: [
        {
          model: User,
          attributes: ['id'],
        },
        {
          model: Room,
          attributes: ['owner_id'],
        },
      ],
    });

    // Verificar se o material foi encontrado
    if (!material) {
      return res.status(404).json({ message: 'Material não encontrado.' });
    }

    // Verificar se o usuário é o dono da sala ou o próprio usuário que enviou o material
    const isOwner = material.Room.owner_id === user_id;
    const isAuthor = material.user_id === user_id;

    if (material.is_room_created) {
      return res.status(400).json({ message: 'Este material não pode ser excluído, pois foi criado a sala a partir dele.' });
    }

    // Verificar as permissões
    if (!(isOwner || isAuthor)) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este material.' });
    }

    await material.destroy();

    return res.status(200).json({ message: 'Material excluído com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao excluir material', error: error.message });
  }
};

// Encontrar todas as salas onde o usuário tenha enviado algum material
export const getRoomsWithUserMaterials = async (req, res) => {
  try {

    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const rooms = await Room.findAll({
      where: {
        owner_id: { [Op.ne]: user_id }, // Excluir salas onde o usuário é o dono
      },
      include: {
        model: RoomMaterial,
        where: { user_id }, // Somente materiais enviados pelo usuário
        required: true, // Garante que apenas salas com materiais enviados pelo usuário sejam retornadas
      },
      attributes: ["id", "name", "description"], // Retorna apenas os dados necessários da sala
    });

    return res.status(200).json({
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        description: room.description,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar salas.", error: error.message });
  }
};