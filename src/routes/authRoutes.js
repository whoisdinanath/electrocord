import express from 'express';
import { signUp, signIn } from '../controllers/authControllers.js';
import {checkDuplicateUsernameOrEmail, checkTcioeEmail} from '../middlewares/verifySignUp.js';


var router = express.Router();

router.post('/signup', checkDuplicateUsernameOrEmail, checkTcioeEmail, signUp);
router.post('/signin', signIn);

export default router;