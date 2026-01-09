const supabase = require('../config/supabase');
const userService = require('../services/userService');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        req.auth = {
            userId: user.id,
            email: user.email
        };

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Token verification failed.'
        });
    }
};

const loadUser = async (req, res, next) => {
    try {
        const user = await userService.getUserByIdpId(req.auth.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const requireAdmin = async (req, res, next) => {
    const user = await userService.getUserByIdpId(req.auth.userId);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'User not found'
        });
    }

    if (user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    req.user = user;
    next();
};

module.exports = { authenticate, loadUser, requireAdmin };
