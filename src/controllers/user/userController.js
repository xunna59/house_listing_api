const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const userController = {

    createUser: async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    msg: err.msg,
                    key: err.path,
                })),
            });
        }

        try {
            const { name, email, password, } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists. Please use a different email.",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
            });

            const payload = { id: user.id, email: user.email, };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

            res.status(201).json({
                success: true,
                message: "User created successfully",
                user: {
                    name: user.name,
                    email: user.email,

                },
                token

            });
        } catch (error) {
            next(error);
        }
    },

    loginUser: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false, errors: errors.array().map(err => ({
                    msg: err.msg,
                    key: err.path,
                })),
            });
        }

        try {
            const { email, password } = req.body;


            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }


            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }


            const payload = { id: user.id, email: user.email, route: 'user-auth', role: 'User' };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });


            res.status(200).json({
                success: true,
                message: "Login successful",
                token
            });
        } catch (error) {
            next(error);
        }
    },


    getUserProfile: async (req, res, next) => {

        try {

            if (!req.user || !req.user.id) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }

            const userId = req.user.id;


            const user = await User.findOne({
                where: { id: userId },
                attributes: ['name', 'lastname', 'email',],
            });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            return res.status(200).json({
                success: true,
                data: user,
            });

        } catch (error) {
            next(error);
        }
    },
}


module.exports = userController;