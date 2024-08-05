import sql from '../database/db.js';
import { ApiError, ApiResponse } from '../utils/sendResponse.js';

export const getUsers = async (req, res) => {
    try {
        const users = await sql`SELECT user_id, username, email, dob, profile_pic, is_admin FROM users WHERE is_active=true`;
        res.status(200).json(new ApiResponse(200, 'Users fetched successfully', users));
    } catch (error) {
        throw error;
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await sql`SELECT user_id, username, email, dob , profile_pic, is_admin FROM users WHERE user_id = ${id}`;
        return res.status(200).json(new ApiResponse(200, 'User fetched successfully', user));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while fetching user', [error.message]));
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await sql`DELETE FROM users WHERE user_id = ${id} RETURNING *`;
        if (!user || !user.length === 0) throw new Error('User not found');
        return res.status(200).json(new ApiResponse(200, 'User deleted successfully'));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while deleting user', [error.message]));
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;

        // Validate inputs
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: 'ID and at least one field to update are required' });
        }

        // Construct and execute the UPDATE query dynamically
        await sql`
          update users set ${
            sql(fieldsToUpdate, ...Object.keys(fieldsToUpdate))
          }
          where user_id = ${id}
        `;

        return res.status(200).json(new ApiResponse(200, 'User updated successfully'));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while updating user', [error.message]));
    }
}