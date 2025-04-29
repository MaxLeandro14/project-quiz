'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const categories = [
      { name: 'Disciplina' },
      { name: 'Banca Examinadora' },
      { name: 'Conteúdo Programático' },
    ].map(category => ({
      id: uuidv4(),
      name: category.name,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('categories', categories);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
