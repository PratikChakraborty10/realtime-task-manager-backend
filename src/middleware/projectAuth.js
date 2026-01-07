const projectService = require('../services/projectService');
const userService = require('../services/userService');

const requireOwner = async (req, res, next) => {
    const user = await userService.getUserByIdpId(req.auth.userId);
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'User not found'
        });
    }

    const isOwner = await projectService.isProjectOwner(req.params.id, user._id);
    if (!isOwner) {
        return res.status(403).json({
            success: false,
            message: 'Only project owner can perform this action'
        });
    }

    req.user = user;
    next();
};

const requireMember = async (req, res, next) => {
    const user = await userService.getUserByIdpId(req.auth.userId);
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'User not found'
        });
    }

    const isMember = await projectService.isProjectMember(req.params.id, user._id);
    if (!isMember) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Not a project member.'
        });
    }

    req.user = user;
    next();
};

module.exports = { requireOwner, requireMember };
