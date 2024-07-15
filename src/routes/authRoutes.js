import express from 'express';
import { signUp, signIn, activateAccount, regenerateOtp, resetPassword, changePassword } from '../controllers/authControllers.js';
import {checkDuplicateUsernameOrEmail, checkTcioeEmail} from '../middlewares/verifySignUp.js';
import { verifyOtp } from '../middlewares/verifyOtp.js';
import { multerUploads } from '../utils/multerHandler.js';

var router = express.Router();

router.post('/signup',multerUploads.any(), checkDuplicateUsernameOrEmail, checkTcioeEmail,  signUp);
router.post('/signin', signIn);
router.post('/activate', verifyOtp, activateAccount);
router.post('/regenerate', regenerateOtp);
router.post('/reset', resetPassword);
router.post('/change', changePassword);


export default router;