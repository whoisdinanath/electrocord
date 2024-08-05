import { uploadToAzure } from "../utils/azureUpload.js";
import { ApiError, ApiResponse } from "../utils/sendResponse.js";

export const uploadAttachment = async (req, res) => {
    try {
        const uploadedFiles = await uploadToAzure(req);
        return res.status(200).json(new ApiResponse(200, 'Files uploaded successfully', uploadedFiles));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while uploading files', [error.message]));
    }
};
