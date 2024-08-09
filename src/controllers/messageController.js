import sql from '../database/db.js'
import { ApiResponse, ApiError } from '../utils/sendResponse.js';
import { formatMessages } from '../utils/formatMessage.js';

export const getMessages = async (req, res) => {
    try{
    const { chat_id } = req.params;
    const messages = await sql`SELECT m.message_id as id, m.chat_id as chatId, m.sender_id as senderId, u.username as senderName, u.profile_pic as senderProfile,  m.message,  m.created_at, m.updated_at, a.original_name, a.uploaded_name, a.file_path, a.file_type FROM messages m JOIN users u ON m.sender_id = u.user_id LEFT JOIN message_attachments a ON m.message_id = a.message_id WHERE chat_id = ${chat_id} ORDER BY m.created_at DESC`;
    return res.status(200).send(new ApiResponse(200, 'Messages fetched successfully.', formatMessages(messages)));
    } catch(error) {
            return res.status(400).send(new ApiError(400, 'An error occurred while fetching messages.', error.message));
    }
}

export const getMessageById = async (req, res) => {
    try{
    const { id } = req.params;
    const message = await sql`SELECT m.message_id as id, m.chat_id as chatId, m.sender_id as senderId, u.username as senderName, u.profile_pic as senderProfile,  m.message,  m.created_at, m.updated_at, a.original_name, a.uploaded_name, a.file_path, a.file_type FROM messages m JOIN users u ON m.sender_id = u.user_id LEFT JOIN message_attachments a ON m.message_id = a.message_id WHERE message_id = ${id} ORDER BY m.created_at DESC`;
    return res.status(200).send(new ApiResponse(200, 'Message fetched successfully.', message));
    } catch(error) {
         return res.status(400).send(new ApiError(400, 'An error occurred while fetching message.', error.message));
    }
}

export const getMessagePaginated = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const { page = 1, limit = 15 } = req.query; // default page 1 and limit 15

        const offset = (page - 1) * limit;  // offset calculation , which page and how many messages per page
        const messages = await sql`
            SELECT m.message_id as id, m.chat_id as chatId, m.sender_id as senderId, 
                   u.username as senderName, u.profile_pic as senderProfile,  
                   m.message, m.created_at, m.updated_at, 
                   a.original_name, a.uploaded_name, a.file_path, a.file_type 
            FROM messages m 
            JOIN users u ON m.sender_id = u.user_id 
            LEFT JOIN message_attachments a ON m.message_id = a.message_id 
            WHERE chat_id = ${chat_id} 
            ORDER BY m.created_at DESC 
            LIMIT ${limit} OFFSET ${offset}`;

        const totalMessages = await sql`SELECT COUNT(*) FROM messages WHERE chat_id = ${chat_id}`;

        return res.status(200).send(new ApiResponse(200, 'Messages fetched successfully.', {
            messages: formatMessages(messages),
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalMessages[0].count / limit),
            totalMessages: totalMessages[0].count
        }));
    } catch (error) {
        return res.status(400).send(new ApiError(400, 'An error occurred while fetching messages.', error.message));
    }
}


export const createMessage = async (req, res) => {
    try{
        const { chat_id, message, sender_id } = req.body;
        if (!chat_id || !message || !sender_id) {
            return res.status(400).json({message: 'Chat ID, Message and Sender ID are required'});
        }

        const created = await sql`INSERT INTO messages (chat_id, message, sender_id) VALUES (${chat_id}, ${message}, ${sender_id}) RETURNING *`;
        return res.status(200).send(new ApiResponse(200, 'Message created successfully.', created));
    } catch (error) {
        return res.status(400).send(new ApiError(400, 'An error occurred while creating the message.', error.message));
    }
}

export const updateMessage = async (req, res) => {
    try{
        const { id } = req.params;
        const fieldsToUpdate = req.body;
        console.log(req.body, id);
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({message: 'ID and at least one field to update are required'});
        }
        await sql`
          update messages set ${
            sql(fieldsToUpdate, ...Object.keys(fieldsToUpdate))
          }
          where message_id = ${id}
        `;
        return res.status(200).json(new ApiResponse(200, 'Message updated successfully'));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while updating the message', error.message));
    }
}

export const deleteMessage = async (req, res) => {
    try{
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }
        await sql`DELETE FROM messages WHERE message_id = ${id}`;
        return res.status(200
        ).json(new ApiResponse(200, 'Message deleted successfully'));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while deleting the message', error.message));
    }
}