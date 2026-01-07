const supabase = require('../config/supabase');


const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (error) {
        throw new Error(error.message);
    }

    return data.user;
};

/**
 * Authenticate user with email and password
 */
const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new Error(error.message);
    }

    return {
        user: data.user,
        session: data.session
    };
};

module.exports = {
    signUp,
    signIn
};
