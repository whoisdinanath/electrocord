import sql from '../database/db.js'
import { ApiError, ApiResponse } from '../utils/sendResponse.js';

export const getChats = async(req, res) => {
    try {
        const chats = await sql`SELECT * FROM chats`;
        res.status(200).json(new ApiResponse(200, 'Chats fetched successfully', chats));
    } catch (error) {
        throw error;
    }
}

export const getChatById = async(req, res) => {
    try {
        const { id } = req.params;
        const chat = await sql`SELECT * FROM chats WHERE id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Chat fetched successfully', chat));
    } catch (error) {
        throw error;
    }
}


export const createChat = async(req, res) => {
    try {
        const {name, type, description = null, category} = req.body;
        if (!name || !type || !category) {
            return res.status(400).json({message: 'Name, Type and Category are required'});
        }
        const created = await sql`INSERT INTO chats (name, type, description, category) VALUES (${name}, ${type}, ${description}, ${category})`;
        res.status(201).json(new ApiResponse(201, 'Chat created successfully'));
    }
    catch (error) {
        throw error;
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

        res.status(200).json({message: 'Chat updated successfully'});
    } catch (error) {
        res.status(500).json({message: 'An error occurred while updating the chat', error: error.message});
    }
}

export const deleteChat = async(req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }
        await sql`DELETE FROM chats WHERE id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Chat deleted successfully'));
    } catch (error) {
        throw error;
    }
}