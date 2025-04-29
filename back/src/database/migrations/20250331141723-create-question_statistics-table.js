'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("question_statistics", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "questions", key: "id" },
        onDelete: "CASCADE",
      },
      total_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Número total de tentativas na questão
      },
      correct_answers: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Quantidade de respostas corretas
      },
      incorrect_answers: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Quantidade de respostas erradas
      },
      difficulty_easy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Quantidade de usuários que acharam fácil
      },
      difficulty_medium: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Quantidade de usuários que acharam intermediário
      },
      difficulty_hard: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Quantidade de usuários que acharam difícil
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("question_statistics");
  },
};
