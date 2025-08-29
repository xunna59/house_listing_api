const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;




const authenticateUser = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'Access denied - No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. Invalid token format.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        if (req.user.role !== 'User') {
            return res.status(403).json({ success: false, error: 'Access denied.' });
        }

        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token.', expired: true });
    }
};

module.exports = authenticateUser;
