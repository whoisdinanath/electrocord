import sql from '../database/db.js'
import { ApiResponse } from '../utils/sendResponse.js';
import { formatMessages } from '../utils/formatMessage.js';

export const getMessages = async (req, res) => {
    try{
    const { chat_id } = req.params;
    const messages = await sql`SELECT m.message_id as id, m.chat_id as chatId, m.sender_id as senderId, u.username as senderName, m.message,  m.created_at, m.updated_at, a.original_name, a.uploaded_name, a.file_path, a.file_type FROM messages m JOIN users u ON m.sender_id = u.user_id LEFT JOIN message_attachments a ON m.message_id = a.message_id WHERE chat_id = ${chat_id} ORDER BY m.created_at ASC`;
    res.status(200).send(new ApiResponse(200, 'Messages fetched successfully.', formatMessages(messages)));
    } catch(error) {
        throw error;
    }
}

export const getMessageById = async (req, res) => {
    try{
    const { id } = req.params;
    const message = await sql`SELECT * FROM messages WHERE message_id = ${id}`;
    res.status(200).send(new ApiResponse(200, 'Message fetched successfully.', message));
    } catch(error) {
        throw error;
    }
}

export const createMessage = async (req, res) => {
    try{
        const { chat_id, message, sender_id } = req.body;
        // const { attachments } = req.files;
        if (!chat_id || !message || !sender_id) {
            return res.status(400).json({message: 'Chat ID, Message and Sender ID are required'});
        }

        // just a workout for now, until using azure blob storage
        // ##################################### needs to be change
        // const fileArray = [];
        // if (attachments) {
        //     if (Array.isArray(attachments)) {
        //         attachments.forEach(file => {
        //             fileArray.push(file.path);
        //         });
        //     } else {
        //         fileArray.push(attachments.path);
        //     }
        // }
        const created = await sql`INSERT INTO messages (chat_id, message, sender_id) VALUES (${chat_id}, ${message}, ${sender_id})`;
        res.status(201).send(new ApiResponse(201, 'Message created successfully.', created));
    } catch (error) {
        throw error;
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
        res.status(200).json({message: 'Message updated successfully'});
    } catch (error) {
        res.status(500).json({message: 'An error occurred while updating the message', error: error.message});
    }
}

export const deleteMessage = async (req, res) => {
    try{
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }
        await sql`DELETE FROM messages WHERE message_id = ${id}`;
        res.status(200).json({message: 'Message deleted successfully'});
    } catch (error) {
        res.status(500).json({message: 'An error occurred while deleting the message', error: error.message});
    }
}