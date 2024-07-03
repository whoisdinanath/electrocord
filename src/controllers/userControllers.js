import sql from '../database/db.js';
import { ApiError, ApiResponse } from '../utils/sendResponse.js';

export const getUsers = async (req, res) => {
    try {
        const users = await sql`SELECT user_id, username, email, dob FROM users`;
        res.status(200).json(new ApiResponse(200, 'Users fetched successfully', users));
    } catch (error) {
        throw error;
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await sql`SELECT user_id, username, email, dob FROM users WHERE user_id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'User fetched successfully', user));
    } catch (error) {
        throw error;
    }
}