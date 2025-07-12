const ErrorResponse = require('../utils/errorResponse');

// Role-based access control middleware
exports.roleMiddleware = (requiredRoles) => {
    return (req, res, next) => {
        if (!requiredRoles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `Role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};

// Ownership check middleware
exports.checkOwnership = (model, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const resource = await model.findById(req.params[paramName]);

            if (!resource) {
                return next(new ErrorResponse('Resource not found', 404));
            }

            // Check if user is owner or admin
            if (resource.author.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrorResponse('Not authorized to access this resource', 403));
            }

            req.resource = resource;
            next();
        } catch (error) {
            next(error);
        }
    };
};