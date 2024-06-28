import { getSemesters, getSemesterById, createSemester } from "../controllers/semesterControllers.js";
import { isAdmin, isModerator, verifyToken } from "../middlewares/authJwt.js";
import express from 'express';

var router = express.Router();
router.get('/',  verifyToken, getSemesters);
router.get('/:id', verifyToken, getSemesterById);
router.post('/', verifyToken, (req, res, next) => {
    if (isAdmin(req)) {
        return createSemester(req, res, next);
    }
    if (isModerator(req)) {
        return createSemester(req, res, next);
    } else {
        return res.status(403).send({ message: "Require Admin or Moderator Role!" });
    }
});

export default router;