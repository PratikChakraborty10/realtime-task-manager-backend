const User = require('../models/User');

/**
 * Create a new user in MongoDB
 */
const createUser = async ({ idpUserId, name, gender, email }) => {
    const user = await User.create({
        idpUserId,
        name,
        gender,
        email
    });
    return user;
};

/**
 * Find user by Supabase user ID
 */
const getUserByIdpId = async (idpUserId) => {
    return User.findOne({ idpUserId });
};

/**
 * Find user by MongoDB ID
 */
const getUserById = async (id) => {
    return User.findById(id);
};

module.exports = {
    createUser,
    getUserByIdpId,
    getUserById
};
