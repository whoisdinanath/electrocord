import { getSemesters, getSemesterById, createSemester, updateSemester, deleteSemester, getSemestersEach } from "../controllers/semesterControllers.js";
import { isAdmin, verifyToken } from "../middlewares/authJwt.js";
import express from 'express';

var router = express.Router();
router.get('/',  verifyToken, getSemesters); // get all semester with all details (subjects, chats, resources)
router.get('/each', verifyToken, getSemestersEach); // get all the semesters detail only (only from semester table)
router.get('/:id', verifyToken, getSemesterById); // get all details of specirfic semester (subjects, chats, resources)
router.put('/:id', verifyToken, isAdmin, updateSemester);
router.post('/', verifyToken, isAdmin, createSemester);
router.delete('/:id', verifyToken, isAdmin, deleteSemester);

export default router;