import { getChats, getChatById, createChat, updateChat, deleteChat } from '../controllers/chatControllers.js';
import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

var router = express.Router();

// adding the routes
router.get('/rooms', verifyToken, getChats);
router.get('/rooms/:id', verifyToken, getChatById);
router.post('/rooms', verifyToken, isAdmin, createChat);
router.put('/rooms/:id', verifyToken, isAdmin, updateChat);
router.delete('/rooms/:id', verifyToken, isAdmin, deleteChat);

export default router;