import { multerUploads } from '../config/multerHandler.js'
import express from 'express';
import { uploadToAzure } from '../config/azureUpload.js';

var router = express.Router();


// test route for files upload testing
router.post('/upload', multerUploads.any(), async (req, res) => {
    // console.log("Request Body: ", req.files);
    const uploaded =  await uploadToAzure(req, res);
    // console.log(uploaded);
});

export default router;