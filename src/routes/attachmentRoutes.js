import { uploadAttachment } from "../controllers/uploadAttachment.js";
import express from "express";
import { multerUploads } from "../utils/multerHandler.js";

const router = express.Router();

router.post("/upload", multerUploads.any(), uploadAttachment);

export default router;