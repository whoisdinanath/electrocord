import { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../controllers/announcementController.js";
import { multerUploads } from "../utils/multerHandler.js";
import { Router } from "express";
import { verifyToken, isAdmin } from "../middlewares/authJwt.js";

const router = Router();

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', multerUploads.any(),verifyToken, isAdmin,  createAnnouncement);
router.put('/:id', multerUploads.any(), verifyToken, isAdmin, updateAnnouncement);
router.delete('/:id', verifyToken, isAdmin, deleteAnnouncement);

export default router;