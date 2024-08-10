import { getResources, getResourcesBySubject, getResourceById, createResource, deleteResource, updateResource } from "../controllers/resourceControllers.js";
import { multerUploads } from "../utils/multerHandler.js";
import express from 'express';
import { verifyToken, isAdmin } from "../middlewares/authJwt.js";

var router = express.Router();

// adding the routes
router.get('/', getResources);
router.get('/:id', getResourceById);
router.get('/subject/:id', getResourcesBySubject);
router.post('/', verifyToken, isAdmin, multerUploads.any(), createResource);
router.put('/:id', verifyToken, isAdmin,  multerUploads.any(), updateResource);
router.delete('/:id', verifyToken, isAdmin, deleteResource);


export default router;