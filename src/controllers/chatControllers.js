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
        const chat = await sql`SELECT * FROM chats WHERE chat_id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Chat fetched successfully', chat));
    } catch (error) {
        throw error;
    }
}

export const createChat = async(req, res) => {
    try {
        const {name, type, description = null} = req.body;
        if (!name || !type) {
            return res.status(400).json({message: 'Name and Type are required'});
        }
        const created = await sql`INSERT INTO chats (name, type, description) VALUES (${name}, ${type}, ${description})`;
        res.status(201).json(new ApiResponse(201, 'Chat created successfully', created));
    }
    catch (error) {
        throw error;
    }
}