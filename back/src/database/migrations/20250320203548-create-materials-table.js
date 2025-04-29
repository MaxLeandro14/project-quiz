'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("materials", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      room_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "rooms", key: "id" },
        onDelete: "CASCADE"
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE"
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_url: {  // Somente se for um arquivo
        type: Sequelize.STRING,
        allowNull: true
      },
      transcript_text: {  // Texto extraído do material (PDF, YouTube legendas, artigos)
        type: Sequelize.TEXT,
        allowNull: true
      },
      url: {  // Somente se for um link externo ou YouTube
        type: Sequelize.STRING,
        allowNull: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {  // Descrição opcional do material
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_room_created: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("materials");
  }
};
