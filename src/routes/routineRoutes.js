import express from 'express';
import { getRoutines, getRoutineById, createRoutine, updateRoutine, deleteRoutine } from '../controllers/routineControllers.js';
import { verifyToken } from '../middlewares/authJwt.js';

var router = express.Router();

// adding the routes
router.get('/', verifyToken, getRoutines);
router.get('/:id', verifyToken, getRoutineById);
router.post('/', verifyToken, createRoutine);
router.put('/:id',verifyToken, updateRoutine);
router.delete('/:id', verifyToken, deleteRoutine);

export default router;