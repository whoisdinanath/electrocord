import { multerUploads } from '../utils/multerHandler.js'
import express from 'express';
import { uploadToAzure } from '../utils/azureUpload.js';

var router = express.Router();


// test route for files upload testing
router.post('/upload', multerUploads.any(), async (req, res) => {
    // console.log("Request Body: ", req.files);
    // const uploaded =  await uploadToAzure(req, res); // don't use as the function is not returning any response
    // console.log(uploaded);
});

export default router;