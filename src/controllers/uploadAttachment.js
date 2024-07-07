import { uploadToAzure } from "../utils/azureUpload.js";
import { ApiError, ApiResponse } from "../utils/sendResponse.js";

export const uploadAttachment = async (req, res) => {
    try {
        const uploadedFiles = await uploadToAzure(req);
        res.status(200).json(new ApiResponse(200, 'Files uploaded successfully', uploadedFiles));
    } catch (error) {
        throw error;
    }
};
