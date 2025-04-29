'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Consulta as categorias já inseridas
    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const getCategoryId = (name) =>
      categories.find(c => c.name === name)?.id;

    const tags = [
      // Disciplina
      { name: 'História', category: 'Disciplina' },
      { name: 'Literatura', category: 'Disciplina' },
      { name: 'Biologia', category: 'Disciplina' },
      { name: 'Português', category: 'Disciplina' },
      { name: 'Informática', category: 'Disciplina' },
      { name: 'Raciocínio Lógico', category: 'Disciplina' },

      // Banca Examinadora
      { name: 'CESPE', category: 'Banca Examinadora' },
      { name: 'FGV', category: 'Banca Examinadora' },
      { name: 'VUNESP', category: 'Banca Examinadora' },
      { name: 'IBFC', category: 'Banca Examinadora' },

      // Conteúdo Programático
      { name: 'Constituição Federal', category: 'Conteúdo Programático' },
      { name: 'Lei 8.112/90', category: 'Conteúdo Programático' },
      { name: 'Direito Administrativo', category: 'Conteúdo Programático' },
      { name: 'Direito Constitucional', category: 'Conteúdo Programático' },
    ].map(tag => ({
      id: uuidv4(),
      name: tag.name,
      category_id: getCategoryId(tag.category),
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('tags', tags);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tags', null, {});
  }
};

