import { homePage } from "../controllers/homeController.js";
import express from 'express';

var router = express.Router();

router.get('/', homePage);

export default router;