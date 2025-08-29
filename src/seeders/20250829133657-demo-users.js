'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingUser] = await queryInterface.sequelize.query(
      `SELECT * FROM users WHERE email = 'demo@user.com'`
    );

    const hashedPassword = await bcrypt.hash('password123', 10);

    if (!existingUser.length) {
      await queryInterface.bulkInsert('users', [
        {
          id: uuidv4(),
          name: 'Demo User',
          email: 'demo@user.com',
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    } else {
      await queryInterface.bulkUpdate(
        'users',
        {
          name: 'Demo User',
          password: hashedPassword,
          updated_at: new Date(),
        },
        { email: 'demo@user.com' }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'demo@user.com' });
  },
};
