const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ErrorResponse = require('../utils/errorResponse');

// Generate JWT token
exports.generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Verify JWT token
exports.verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new ErrorResponse('Invalid token', 401);
        }

        return user;
    } catch (error) {
        throw new ErrorResponse('Invalid token', 401);
    }
};

// Check if user has required role
exports.checkRole = (user, requiredRoles) => {
    if (!requiredRoles.includes(user.role)) {
        throw new ErrorResponse(
            `Role ${user.role} is not authorized to access this route`,
            403
        );
    }
    return true;
};