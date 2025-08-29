const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Listing = sequelize.define('Listing', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ownerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'owner_id',
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        title: {
            type: DataTypes.STRING(120),
            allowNull: false,
            validate: { len: [5, 120] },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: { len: [0, 2000] },
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1 },
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'NGN',
        },
        propertyType: {
            type: DataTypes.ENUM('apartment', 'house', 'studio', 'duplex', 'land'),
            allowNull: false,
            field: 'property_type',
        },
        bedrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 0 },
        },
        bathrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 0 },
        },
        areaSqm: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'area_sqm',
            validate: { min: 0 },
        },
        city: { type: DataTypes.STRING, allowNull: false },
        state: { type: DataTypes.STRING, allowNull: false },
        country: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING, allowNull: false },
        amenities: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
        images: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active',
        },
    }, {
        tableName: 'listings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Listing;
};
