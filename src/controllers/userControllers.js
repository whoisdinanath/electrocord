import sql from '../database/db.js';
import { ApiError, ApiResponse } from '../utils/sendResponse.js';
import { uploadToAzure } from '../utils/azureUpload.js';

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
        // remove email from fields to update if the user is not an admin
        if (!req.is_admin) {
            delete fieldsToUpdate.email;
        }

        

        //  unique and not empty
        if (fieldsToUpdate.username) {
            const [existingUser] = await sql`SELECT * FROM users WHERE username = ${fieldsToUpdate.username} AND user_id != ${id}`;
            if (existingUser) {
                return res.status(400).json(new ApiError(400, 'Username already exists'));
            }
        }

        //username must be alphanumeric
        if (fieldsToUpdate.username) {
            if (!/^[a-zA-Z0-9]+$/.test(fieldsToUpdate.username)) {
                return res.status(400).json(new ApiError(400, 'Username must be alphanumeric'));
            }
        }

        // username must not be empty, and must not contain spaces
        if (fieldsToUpdate.username) {
            if (!fieldsToUpdate.username || fieldsToUpdate.username.trim().length === 0) {
                return res.status(400).json(new ApiError(400, 'Username must not be empty'));
            }
        }

        // Validate inputs
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: 'ID and at least one field to update are required' });
        }

        let profileUrl;

        if (req.files && req.files.length > 0) {
            const profilePic = await uploadToAzure(req);
            profileUrl = profilePic[0].filePath;
            fieldsToUpdate.profile_pic = profileUrl;
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