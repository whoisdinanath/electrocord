import express from 'express';
import { getUsers, getUserById } from '../controllers/userControllers.js';

var router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;