import { getMessages, getMessageById, createMessage, deleteMessage, updateMessage, getMessagePaginated } from "../controllers/messageController.js";
import express from 'express';
import { verifyToken } from '../middlewares/authJwt.js';
import { multerUploads } from "../utils/multerHandler.js";

var router = express.Router();

// adding the routes
router.get('/:chat_id', verifyToken, getMessages);
router.get('/details/:id', verifyToken, getMessageById);
router.get('/paginated/:chat_id', verifyToken, getMessagePaginated);
// ################# no need of multer here as we already upload the attachments,if any before creating the message during chats and pass the links through the message/websocket
router.post('/', verifyToken, multerUploads.any(), createMessage);
router.put('/:id', verifyToken, updateMessage);
router.delete('/:id', verifyToken, deleteMessage);

export default router;