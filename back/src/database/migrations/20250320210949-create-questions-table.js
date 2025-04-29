'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("questions", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      material_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'materials', key: 'id' },
        onDelete: 'SET NULL',
        onDelete: "CASCADE"
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("MULTIPLA_ESCOLHA", "EXPLICATIVA", "VERDADEIRO_FALSO"),
        allowNull: false,
      },
      options: {
        type: Sequelize.JSONB, // Armazena JSON como string
        allowNull: true, // Apenas para MULTIPLA_ESCOLHA
      },
      correct_opt: {
        type: Sequelize.STRING,
        allowNull: true, // Apenas para opções
      },
      is_correct_v_f: {
        type: Sequelize.BOOLEAN,
        allowNull: true, // Apenas para VERDADEIRO_FALSO
      },
      explanation: {
        type: Sequelize.JSONB,
        allowNull: true, // Explicação da resposta
      },
      likes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Quantidade de curtidas
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
    await queryInterface.dropTable("questions");
  },
};
