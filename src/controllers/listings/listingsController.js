const { Listing } = require('../../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const listingController = {

    createListing: async (req, res, next) => {
        try {
            const ownerId = req.user?.id;
            if (!ownerId) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }

            await new Promise((resolve, reject) => {
                uploadMedia(req, res, (err) => {
                    if (err) {
                        return res.status(401).json({ success: false, message: 'File upload failed' });
                    }
                    resolve();
                });
            });

            const imageUrls = req.files?.images ? req.files.images.map(file => file.filename) : [];

            let {
                title, description, price, currency, propertyType,
                bedrooms, bathrooms, areaSqm, city, state, country,
                address, amenities
            } = req.body;


            const errors = [];

            if (!title || typeof title !== 'string' || title.length < 5 || title.length > 120) {
                errors.push({ key: 'title', msg: 'Title must be a string between 5 and 120 characters' });
            }

            if (description && (typeof description !== 'string' || description.length > 2000)) {
                errors.push({ key: 'description', msg: 'Description must be a string up to 2000 characters' });
            }

            price = parseInt(price);
            if (!price || price <= 0) {
                errors.push({ key: 'price', msg: 'Price must be a number greater than 0' });
            }

            if (!currency || typeof currency !== 'string') {
                errors.push({ key: 'currency', msg: 'Currency is required' });
            }

            const validTypes = ['apartment', 'house', 'studio', 'duplex', 'land'];
            if (!propertyType || !validTypes.includes(propertyType)) {
                errors.push({ key: 'propertyType', msg: `Property type must be one of ${validTypes.join(', ')}` });
            }

            bedrooms = parseInt(bedrooms);
            bathrooms = parseInt(bathrooms);
            areaSqm = parseInt(areaSqm);

            if (bedrooms < 0) errors.push({ key: 'bedrooms', msg: 'Bedrooms must be >= 0' });
            if (bathrooms < 0) errors.push({ key: 'bathrooms', msg: 'Bathrooms must be >= 0' });
            if (areaSqm < 0) errors.push({ key: 'areaSqm', msg: 'Area must be >= 0' });

            if (!city || !state || !country || !address) {
                errors.push({ key: 'location', msg: 'City, state, country, and address are required' });
            }

            if (errors.length) {
                return res.status(400).json({ success: false, errors });
            }

            amenities = Array.isArray(amenities)
                ? amenities
                : amenities ? JSON.parse(amenities) : [];

            const listing = await Listing.create({
                ownerId,
                title,
                description,
                price,
                currency,
                propertyType,
                bedrooms,
                bathrooms,
                areaSqm,
                city,
                state,
                country,
                address,
                amenities,
                images: imageUrls,
            });

            res.status(201).json({
                success: true,
                message: "Listing created successfully",
                listing
            });

        } catch (error) {
            next(error);
        }
    },


    getAllListings: async (req, res, next) => {
        try {
            let {
                city,
                state,
                status,
                propertyType,
                bedrooms,
                bathrooms,
                minPrice,
                maxPrice,
                amenities,
                q,
                sort,
                page = 1,
                limit = 20,
            } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);
            const offset = (page - 1) * limit;

            const where = {};

            if (city) where.city = city;
            if (state) where.state = state;
            if (status) where.status = status;
            if (propertyType) where.propertyType = propertyType;
            if (bedrooms) where.bedrooms = parseInt(bedrooms);
            if (bathrooms) where.bathrooms = parseInt(bathrooms);
            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice) where.price[Op.gte] = parseInt(minPrice);
                if (maxPrice) where.price[Op.lte] = parseInt(maxPrice);
            }

            if (q) {
                where[Op.or] = [
                    { title: { [Op.iLike]: `%${q}%` } },
                    { description: { [Op.iLike]: `%${q}%` } }
                ];
            }

            if (amenities) {
                const amenityArray = amenities.split(',').map(a => a.trim());
                where.amenities = {
                    [Op.contains]: amenityArray
                };
            }

            let order = [];
            if (sort) {
                const fields = sort.split(',');
                fields.forEach(f => {
                    const direction = f.startsWith('-') ? 'DESC' : 'ASC';
                    const fieldName = f.replace('-', '');
                    order.push([fieldName, direction]);
                });
            } else {
                order = [['created_at', 'DESC']];
            }

            const total = await Listing.count({ where });

            const listings = await Listing.findAll({
                where,
                order,
                offset,
                limit
            });

            res.status(200).json({
                data: listings,
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            });

        } catch (error) {
            next(error);
        }
    },

    getListingById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const listing = await Listing.findOne({ where: { id } });

            if (!listing) {
                return res.status(404).json({ success: false, message: "Listing not found" });
            }

            res.status(200).json({ success: true, listing });
        } catch (error) {
            next(error);
        }
    },

    updateListing: async (req, res, next) => {
        try {
            const { id } = req.params;
            const ownerId = req.user.id;

            if (!req.user || !ownerId) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }

            const listing = await Listing.findOne({ where: { id } });
            if (!listing) {
                return res.status(404).json({ success: false, message: "Listing not found" });
            }

            if (listing.ownerId !== ownerId) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }

            await new Promise((resolve, reject) => {
                uploadMedia(req, res, (err) => {
                    if (err) {
                        return res.status(401).json({ success: false, message: 'File upload failed' });
                    } else {
                        resolve();
                    }
                });
            });

            const imageUrls = req.files?.images
                ? req.files.images.map(file => file.filename)
                : listing.images;

            const updateData = {
                title: req.body.title ?? listing.title,
                description: req.body.description ?? listing.description,
                price: req.body.price ?? listing.price,
                currency: req.body.currency ?? listing.currency,
                propertyType: req.body.propertyType ?? listing.propertyType,
                bedrooms: req.body.bedrooms ?? listing.bedrooms,
                bathrooms: req.body.bathrooms ?? listing.bathrooms,
                areaSqm: req.body.areaSqm ?? listing.areaSqm,
                city: req.body.city ?? listing.city,
                state: req.body.state ?? listing.state,
                country: req.body.country ?? listing.country,
                address: req.body.address ?? listing.address,
                amenities: req.body.amenities
                    ? Array.isArray(req.body.amenities)
                        ? req.body.amenities
                        : JSON.parse(req.body.amenities)
                    : listing.amenities,
                images: imageUrls,
                status: req.body.status ?? listing.status,
            };

            await listing.update(updateData);

            res.status(200).json({
                success: true,
                message: "Listing updated successfully",
                listing
            });

        } catch (error) {
            next(error);
        }
    },



    deleteListing: async (req, res, next) => {
        try {
            const { id } = req.params;
            const ownerId = req.user.id;

            const listing = await Listing.findOne({ where: { id } });

            if (!listing) {
                return res.status(404).json({ success: false, message: "Listing not found" });
            }

            if (listing.ownerId !== ownerId) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }

            await listing.destroy();

            res.status(200).json({
                success: true,
                message: "Listing deleted successfully"
            });

        } catch (error) {
            next(error);
        }
    },
};

module.exports = listingController;
