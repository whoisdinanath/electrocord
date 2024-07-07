import { photoContainer, videoContainer, audioContainer, documentContainer, otherContainer } from '../config/azureBlob.js';
import fs from 'fs/promises'; // Use the promise-based fs module for cleaner code

export const uploadToAzure = async (req) => {
    if (!req.files || req.files.length === 0) {
        throw new Error('No files were uploaded');
    }
    const files = req.files; // Get the files from the request

    // Upload each file to Azure
    const uploadPromises = files.map(async (file) => {
        const filePath = file.path; // Get the path of the file
        const fileName = file.filename; // Get filename
        const mimeType = file.mimetype; // Get the file type
        const originalName = file.originalname; // Get the original name of the file

        // Determine container based on file type
        const fileType = mimeType.split('/')[0];
        let container;
        switch (fileType) {
            case 'image':
                container = photoContainer;
                break;
            case 'video':
                container = videoContainer;
                break;
            case 'audio':
                container = audioContainer;
                break;
            case 'application':
                container = documentContainer;
                break;
            default:
                container = otherContainer;
        }

        try {
            // Upload file to Azure Blob Storage
            const blockBlobClient = container.getBlockBlobClient(fileName);
            console.log('Uploading file to Azure Blob Storage:', fileName);

            // Upload file as a stream
            const fileStream = await fs.readFile(filePath);
            const blobOptions = { blobHTTPHeaders: { blobContentType: mimeType } };
            await blockBlobClient.uploadData(fileStream, blobOptions);

            console.log('File uploaded to Azure Blob Storage:', fileName);

            // Get the URL of the uploaded file
            const url = blockBlobClient.url;

            // Delete the file from the local filesystem
            await fs.unlink(filePath);

            return {
                originalName: originalName,
                uploadedName: fileName,
                filePath: url,
                fileType:fileType,
            };
        } catch (error) {
            console.error('Error uploading file to Azure Blob Storage:', error);
            throw new Error('Error uploading file to Azure Blob Storage');
        }
    });

    try {
        const urls = await Promise.all(uploadPromises);
        return urls; // Return the array of uploaded file details
    } catch (error) {
        console.error('Error during upload process:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
};
