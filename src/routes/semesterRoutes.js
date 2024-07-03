import { getSemesters, getSemesterById, createSemester, updateSemester } from "../controllers/semesterControllers.js";
import { isAdmin, isModerator, verifyToken } from "../middlewares/authJwt.js";
import express from 'express';

var router = express.Router();
router.get('/',  verifyToken, getSemesters);
router.get('/:id', verifyToken, getSemesterById);
router.put('/:id', verifyToken, isAdmin, updateSemester);
router.post('/', verifyToken, (req, res, next) => {
    if (isAdmin(req, res, next)) {
        return createSemester(req, res, next);
    }
    if (isModerator(req, res,next)) {
        return createSemester(req, res, next);
    } else {
        return res.status(403).send({ message: "Require Admin or Moderator Role!" });
    }
});

export default router;