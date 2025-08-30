'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users LIMIT 5`
    );

    if (!users.length) return;

    const images = [
      "1756550118901_newly-built-clean-and-modern-2bedroom-flat-GQrRlgbatgHwDGfCImR1.jpg",
      "1756550118909_newly-built-clean-and-modern-2bedroom-flat-FE8ycjn29oUOiDFTtb5u.jpg",
      "1756550118915_newly-built-clean-and-modern-2bedroom-flat-ZoJUiqiAarMrrA96gu0a.jpg"
    ];

    const amenities = ["wifi", "swimming pool", "car park", "security", "car park"];

    const cities = [
      { city: 'Lagos', state: 'Lagos' },
      { city: 'Abuja', state: 'FCT' },
      { city: 'Port Harcourt', state: 'Rivers' },
      { city: 'Kano', state: 'Kano' }
    ];

    const propertyTypes = ['apartment', 'house', 'studio', 'duplex', 'land'];

    const listings = [];

    for (let i = 0; i < 25; i++) {
      const ownerId = users[i % users.length].id;
      const cityObj = cities[i % cities.length];
      const bedrooms = Math.floor(Math.random() * 5) + 1;
      const bathrooms = Math.floor(Math.random() * 3) + 1;
      const price = (Math.floor(Math.random() * 20) + 1) * 50000;
      const areaSqm = Math.floor(Math.random() * 250) + 50;
      const propertyType = propertyTypes[i % propertyTypes.length];

      listings.push({
        id: uuidv4(),
        owner_id: ownerId,
        title: `${bedrooms}-Bedroom ${propertyType} in ${cityObj.city}`,
        description: `A beautiful ${bedrooms}-bedroom ${propertyType} located in ${cityObj.city}, ${cityObj.state}. Perfect for families or investors.`,
        price,
        currency: 'NGN',
        property_type: propertyType,
        bedrooms,
        bathrooms,
        area_sqm: areaSqm,
        city: cityObj.city,
        state: cityObj.state,
        country: 'Nigeria',
        address: `No ${i + 1}, ${cityObj.city} Main Street`,
        amenities,
        images,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert('listings', listings);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('listings', null, {});
  },
};
