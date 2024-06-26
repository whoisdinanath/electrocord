import { getSemesters, getSemesterById, createSemester } from "../controllers/semesterControllers.js";
import express from 'express';

var router = express.Router();
router.get('/', getSemesters);
router.get('/:id', getSemesterById);
router.post('/', createSemester);

export default router;