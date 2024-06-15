import sql from '../database/db.js';

export const getUsers = async (req, res) => {
    try {
        const users = await sql`SELECT (user_id, username, email, dob) FROM users`;
        res.status(200).json(users);
    } catch (error) {
        throw error;
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await sql`SELECT (user_id, username, email, dob) FROM users WHERE user_id = ${id}`
        res.status(200).json(user);
    } catch (error) {
        throw error;
    }
}