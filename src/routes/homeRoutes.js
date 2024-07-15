import { homePage } from "../controllers/homeController";
import express from 'express';

var router = express.Router();

router.get('/', homePage);

export default router;