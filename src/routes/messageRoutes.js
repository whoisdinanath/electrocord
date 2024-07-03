import { getMessages, getMessageById, createMessage, deleteMessage, updateMessage } from "../controllers/messageController.js";
import express from 'express';
import { verifyToken } from '../middlewares/authJwt.js';
import { multerUploads } from "../config/multerHandler.js";

var router = express.Router();

// adding the routes
router.get('/:chat_id', verifyToken, getMessages);
router.get('/details/:id', verifyToken, getMessageById);
router.post('/', verifyToken, multerUploads.any(), createMessage);
router.put('/:id', verifyToken, updateMessage);
router.delete('/:id', verifyToken, deleteMessage);

export default router;