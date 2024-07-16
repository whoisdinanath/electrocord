import { getSemesters, getSemesterById, createSemester, updateSemester, deleteSemester } from "../controllers/semesterControllers.js";
import { isAdmin, isModerator, verifyToken } from "../middlewares/authJwt.js";
import express from 'express';

var router = express.Router();
router.get('/',  verifyToken, getSemesters);
router.get('/:id', verifyToken, getSemesterById);
router.put('/:id', verifyToken, isAdmin, updateSemester);
router.post('/', verifyToken, isAdmin, createSemester);
router.delete('/:id', verifyToken, isAdmin, deleteSemester);

export default router;