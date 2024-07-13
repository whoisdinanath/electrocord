import express from 'express';
import { signUp, signIn, activateAccount } from '../controllers/authControllers.js';
import {checkDuplicateUsernameOrEmail, checkTcioeEmail} from '../middlewares/verifySignUp.js';
import { verifyOtp } from '../middlewares/verifyOtp.js';

var router = express.Router();

router.post('/signup', checkDuplicateUsernameOrEmail, checkTcioeEmail, signUp);
router.post('/signin', signIn);
router.post('/activate', verifyOtp, activateAccount);

export default router;