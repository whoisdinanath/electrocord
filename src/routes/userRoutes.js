import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userControllers.js';
import { verifyToken, verifySelf } from '../middlewares/authJwt.js';

var router = express.Router();

router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken,  getUserById);
router.put('/:id', verifyToken, verifySelf, updateUser);
router.delete('/:id', verifyToken, verifySelf, deleteUser);

export default router;