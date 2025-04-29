'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("room_tags", {
      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "rooms",
          key: "id"
        },
        onDelete: "CASCADE",
        primaryKey: true
      },
      tag_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "tags",
          key: "id"
        },
        onDelete: "CASCADE",
        primaryKey: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("room_tags");
  },
};
