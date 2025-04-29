'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("subscription", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE"
    },
    provider: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'stripe' // Pode ser 'stripe', 'paypal', 'outro'
    },
    subscription_provider_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    customer_provider_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    plan: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    },
    current_period_start: {
        type: Sequelize.DATE,
        allowNull: false
    },
    current_period_end: {
        type: Sequelize.DATE,
        allowNull: false
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
    await queryInterface.dropTable("subscription");
  },
};
