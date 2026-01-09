const authService = require('../services/authService');
const userService = require('../services/userService');

const ALLOWED_GENDERS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];

const signup = async (req, res) => {
    try {
        const { name, gender, email, password } = req.body;

        // Validate all required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (!gender) {
            return res.status(400).json({
                success: false,
                message: 'Gender is required'
            });
        }

        if (!ALLOWED_GENDERS.includes(gender.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: `Gender must be one of: ${ALLOWED_GENDERS.join(', ')}`
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Create user in Supabase
        const supabaseUser = await authService.signUp(email, password);

        // Create user in MongoDB
        const user = await userService.createUser({
            idpUserId: supabaseUser.id,
            name: name.trim(),
            gender: gender.toUpperCase(),
            email
        });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                gender: user.gender,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * POST /login
 * Authenticate with Supabase
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Authenticate with Supabase
        const { user: supabaseUser, session } = await authService.signIn(email, password);

        // Get user from MongoDB
        const user = await userService.getUserByIdpId(supabaseUser.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found in database'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken: session.access_token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                gender: user.gender,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /get-profile
 * Get current user's profile (protected)
 */
const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserByIdpId(req.auth.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                gender: user.gender,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
};

module.exports = {
    signup,
    login,
    getProfile
};
