import express from 'express';
import { getRoutines, getRoutineById, createRoutine, updateRoutine, deleteRoutine } from '../controllers/routineControllers.js';

var router = express.Router();

// adding the routes
router.get('/', getRoutines);
router.get('/:id', getRoutineById);
router.post('/', createRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

export default router;