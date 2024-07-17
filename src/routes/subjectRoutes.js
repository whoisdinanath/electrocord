import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } from "../controllers/subjectControllers.js";
import { isAdmin, verifyToken } from "../middlewares/authJwt.js";

import express from 'express';

var router = express.Router();
router.get('/',  getSubjects);
router.get('/:id', verifyToken, getSubjectById);
router.post('/', verifyToken, isAdmin, createSubject);
router.put('/:id', verifyToken, isAdmin, updateSubject);
router.delete('/:id', verifyToken, isAdmin, deleteSubject);

export default router;