import express from 'express';
import { getUsers, getUserById } from '../controllers/userControllers.js';
import { verifyToken } from '../middlewares/authJwt.js';

var router = express.Router();

router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUserById);

export default router;