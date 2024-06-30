import { photoContainer, videoContainer, audioContainer, documentContainer, otherContainer } from './azureBlob.js';
import fs from 'fs';

export const uploadToAzure = async (req, res) => {
    if (!req.files) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }
    // upload each files to azure
    const uploadPromises = req.files.map(async (file) => {
        const filePath = file.path; // get the path of the file
        const fileName = file.filename; // get filename
        const mimeType = file.mimetype; // get the file type
        // making a buffer from the file
        const fileBuffer = Buffer.from(filePath, 'base64');
        // console.log(file);
        const fileType = mimeType.split('/')[0];
        var container;
        if (fileType === 'image') {
            container = photoContainer;
        } else if (fileType === 'video') {
            container = videoContainer;
        }
        else if (fileType === 'audio') {
            container = audioContainer;
        }
        else if (fileType === 'application') {
            container = documentContainer;
        }
        else {
            container = otherContainer;
        }
        
        try {
            // Upload file to Azure Blob Storage
            const blockBlobClient = container.getBlockBlobClient(fileName);

            // add the file type as metadata
            const blobOptions = { blobHTTPHeaders: { blobContentType: mimeType } };
            let filestream = fs.createReadStream(filePath);
            await blockBlobClient.uploadStream(filestream, undefined, undefined, blobOptions);
            // get the url of the uploaded file
            const url = blockBlobClient.url;
            const fileDetails = {
                filename: fileName,
                url: url,
            }
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });

            return fileDetails;
        } catch (error) {
            console.error('Error uploading file to Azure Blob Storage:', error);
            throw new Error('Error uploading file.');
        }
    });

    try {
        const urls = await Promise.all(uploadPromises);
        res.send({ message: 'Files uploaded successfully.', urls });
        return urls;
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
    
};


