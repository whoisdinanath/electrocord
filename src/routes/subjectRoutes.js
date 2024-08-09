import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject, getSubjectsEach, getSubjectsBySemester} from "../controllers/subjectControllers.js";
import { isAdmin, verifyToken } from "../middlewares/authJwt.js";

import express from 'express';

var router = express.Router();
router.get('/',verifyToken,  getSubjects); // get all subjects with all details
router.get('/each', verifyToken, getSubjectsEach); // display all subjects only
router.get('/semester/:id', verifyToken, getSubjectsBySemester); // display subjects by semester (only subject and semester details)
router.get('/:id', verifyToken, getSubjectById); // get the subject details by id (all details)
router.post('/', verifyToken, isAdmin, createSubject);
router.put('/:id', verifyToken, isAdmin, updateSubject);
router.delete('/:id', verifyToken, isAdmin, deleteSubject);


export default router;