import sql from '../database/db.js'
import { ApiError, ApiResponse } from '../utils/sendResponse.js';

export const getChats = async(req, res) => {
    try {
        const chats = await sql`SELECT c.id, c.name, c.type, c.description, c.category, g.general_category, c.created_At, c.updated_at FROM chats c LEFT JOIN general_chats g ON c.id=g.chat_id;`;
        return res.status(200).json(new ApiResponse(200, 'Chats fetched successfully', chats));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while fetching chats', [error.message]));
    }
}

export const getChatById = async(req, res) => {
    try {
        const { id } = req.params;
        const chat = await sql`SELECT c.id, c.name, c.type, c.description, c.category, g.general_category, c.created_At, c.updated_at FROM chats c LEFT JOIN general_chats g ON c.id=g.chat_id WHERE id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Chat fetched successfully', chat));
    } catch (error) {
        res.status(400).json(new ApiError(400, 'An error occurred while fetching chat', [error.message]));
    }
}


export const createChat = async(req, res) => {
    try {
        const {name, type, description = null, category} = req.body;
        if (!name || !type || !category) {
            throw new ApiError(400, 'Name, type, and category are required');
        }
        const chat = await sql`INSERT INTO chats (name, type, description, category) VALUES (${name}, ${type}, ${description}, ${category}) RETURNING *`;

        if (category === 'general') {
            const { general_category } = req.body;
            if (!general_category) {
                throw new ApiError(400, 'General category is required');
            }
            const chat_id = chat[0].id;
            await sql`INSERT INTO general_chats (chat_id, general_category) VALUES (${chat_id}, ${general_category})`;
        }
        res.status(200).json(new ApiResponse(200, 'Chat created successfully', chat));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while creating the chat', [error.message]));
    }
}


export const updateChat = async(req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;

        // Validate inputs
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({message: 'ID and at least one field to update are required'});
        }

        // Construct and execute the UPDATE query dynamically
        await sql`
          update chats set ${
            sql(fieldsToUpdate, ...Object.keys(fieldsToUpdate))
          }
          where id = ${id}
        `;

        return res.status(200).json(new ApiResponse(200, 'Chat updated successfully'));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while updating the chat', [error.message
        ]));
    }
}

export const deleteChat = async(req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }
        await sql`DELETE FROM chats WHERE id = ${id}`;
        return res.status(200).json(new ApiResponse(200, 'Chat deleted successfully'));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while deleting the chat', [error.message]));
    }
}