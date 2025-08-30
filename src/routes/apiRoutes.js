const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authenticateUser = require('../middleware/authMiddleware');
const userController = require('../controllers/user/userController');
const listingController = require('../controllers/listings/listingsController');
const rateLimit = require('express-rate-limit');


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
});


router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'Application is running smoothly!',
    });
});



router.post('/auth/register',

    [
        body('name').notEmpty().withMessage('Name is required.'),
        body('email').isEmail().withMessage('Email is required.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    userController.createUser
);


router.post('/auth/login',
    [
        body('email').isEmail().withMessage('Email is required.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    loginLimiter,
    userController.loginUser
);

router.get('/auth/me', authenticateUser, userController.getUserProfile);

router.post('/listings', authenticateUser, listingController.createListing);
router.get('/listings', listingController.getAllListings);
router.get('/listings/:id', listingController.getListingById);


router.patch(
    '/listings/:id',
    authenticateUser,
    [
        param('id').notEmpty().withMessage('Listing ID is required.'),
        body('title').optional().isLength({ min: 5, max: 120 }),
        body('description').optional().isLength({ max: 2000 }),
        body('price').optional().isInt({ min: 1 }),
        body('currency').optional().isString(),
        body('propertyType').optional().isIn(['apartment', 'house', 'studio', 'duplex', 'land']),
        body('bedrooms').optional().isInt({ min: 0 }),
        body('bathrooms').optional().isInt({ min: 0 }),
        body('areaSqm').optional().isInt({ min: 0 }),
        body('city').optional().isString(),
        body('state').optional().isString(),
        body('country').optional().isString(),
        body('address').optional().isString(),
        body('amenities').optional(),
        body('status').optional().isIn(['active', 'inactive']),
    ],
    listingController.updateListing
);

router.delete(
    '/listings/:id',
    authenticateUser,
    [param('id').notEmpty().withMessage('Listing ID is required.')],
    listingController.deleteListing
);





module.exports = router;
