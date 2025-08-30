'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('listings', ['city', 'state'], {
      name: 'idx_listings_city_state',
    });

    await queryInterface.addIndex('listings', ['price'], {
      name: 'idx_listings_price',
    });

    await queryInterface.addIndex('listings', ['bedrooms'], {
      name: 'idx_listings_bedrooms',
    });

    await queryInterface.addIndex('listings', ['status'], {
      name: 'idx_listings_status',
    });

    await queryInterface.addIndex('listings', ['created_at'], {
      name: 'idx_listings_created_at',
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE listings
      ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))
      ) STORED;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_listings_search_vector ON listings USING GIN(search_vector);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_listings_search_vector;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE listings DROP COLUMN IF EXISTS search_vector;
    `);

    await queryInterface.removeIndex('listings', 'idx_listings_city_state');
    await queryInterface.removeIndex('listings', 'idx_listings_price');
    await queryInterface.removeIndex('listings', 'idx_listings_bedrooms');
    await queryInterface.removeIndex('listings', 'idx_listings_status');
    await queryInterface.removeIndex('listings', 'idx_listings_created_at');
  },
};
