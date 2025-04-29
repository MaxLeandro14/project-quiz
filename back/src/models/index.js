import { Sequelize } from 'sequelize';
import config from '../config/database.js';

import User from './User.js';
import Room from './Room.js';
import Materials from './Material.js';
// import Subscription from './Subscription.js';
import QuestionComments from './QuestionComments.js';
import QuestionStatistics from './QuestionStatistics.js';
import SavedRooms from './SavedRooms.js';
import RoomReports from './RoomReports.js';
import Question from './Question.js';

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  define: config.define,
});

// Definindo os modelos e associando-os
User.init(sequelize);
Room.init(sequelize);
Materials.init(sequelize);
// Subscription.init(sequelize);
QuestionComments.init(sequelize);
QuestionStatistics.init(sequelize);
SavedRooms.init(sequelize);
RoomReports.init(sequelize);
Question.init(sequelize);

// Relação entre Usuário e Sala
User.hasMany(Room, { foreignKey: 'owner_id' });
Room.belongsTo(User, { foreignKey: 'owner_id' });

// Relação entre Sala e Materiais
Room.hasMany(Materials, { foreignKey: 'room_id' });
Materials.belongsTo(Room, { foreignKey: 'room_id' });

// Relação entre Usuário e Materiais (quem enviou o material)
User.hasMany(Materials, { foreignKey: 'user_id' });
Materials.belongsTo(User, { foreignKey: 'user_id' });

// Relação entre Usuário e Assinatura (Subscription)
// User.hasMany(Subscription, { foreignKey: 'user_id' });
// Subscription.belongsTo(User, { foreignKey: 'user_id' });

// Assinatura está vinculada a uma Sala
// Subscription.belongsTo(Room, { foreignKey: 'room_id' });
// Room.hasMany(Subscription, { foreignKey: 'room_id' });

// Relação entre Perguntas e Comentários de Perguntas
Question.hasMany(QuestionComments, { foreignKey: 'question_id' });
QuestionComments.belongsTo(Question, { foreignKey: 'question_id' });

// Relação entre Usuário e Comentários de Perguntas
User.hasMany(QuestionComments, { foreignKey: 'user_id' });
QuestionComments.belongsTo(User, { foreignKey: 'user_id' });

// Relação entre Materiais e Perguntas
Materials.hasMany(Question, { foreignKey: 'material_id' });
Question.belongsTo(Materials, { foreignKey: 'material_id' });

// Relação entre Perguntas e Estatísticas de Perguntas
Question.hasOne(QuestionStatistics, { foreignKey: 'question_id', onDelete: 'CASCADE' });
QuestionStatistics.belongsTo(Question, { foreignKey: 'question_id' });

// respostas a comentários**

QuestionComments.hasMany(QuestionComments, {
  foreignKey: 'parent_comment_id',
  as: 'replies'
});

QuestionComments.belongsTo(QuestionComments, {
  foreignKey: 'parent_comment_id',
  as: 'parentComment'
});

Room.hasMany(SavedRooms, {
  foreignKey: 'room_id'
});
SavedRooms.belongsTo(Room, {
  foreignKey: 'room_id'
});

//Room.belongsToMany(Tag, { through: 'room_tags', foreignKey: 'room_id' });
//Tag.belongsToMany(Room, { through: 'room_tags', foreignKey: 'tag_id' });

export { sequelize, User, Room, Materials };
