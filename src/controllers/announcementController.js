import sql from "../database/db.js";
import { uploadToAzure } from "../utils/azureUpload.js";
import { ApiError, ApiResponse } from "../utils/sendResponse.js";


export const getAnnouncements = async(req, res) => {
    try {
        const announcements = await sql`SELECT a.announcement_id, a.title, a.message, a.category, a.attachment, a.created_at, a.updated_at, u.username, u.fullname, u.email, u.profile_pic FROM announcements a JOIN users u ON a.user_id = u.user_id`;
        return res.status(200).json(new ApiResponse(200, 'Announcements fetched successfully', announcements));
    } catch (error) {
        return res.status(500).json(new ApiError(500, 'An error occurred while fetching announcements', [error.message]));
    }
}

export const getAnnouncementById = async(req, res) => {
    try {
        const { id } = req.params;
        const announcement = await sql`SELECT a.announcement_id, a.title, a.message, a.category, a.attachment, a.created_at, a.updated_at, u.username, u.fullname, u.email, u.profile_pic FROM announcements a JOIN users u ON a.user_id = u.user_id WHERE a.announcement_id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Announcement fetched successfully', announcement));
    } catch (error) {
        res.status(500).json(new ApiError(500, 'An error occurred while fetching announcement', [error.message]));
    }
}



export const createAnnouncement = async (req, res) => {
    try {
        const { title, message, category } = req.body;
        const user_id = req.userId;
        console.log(title, message, category, user_id);

        if (!title || !message || !category) {
            throw new ApiError(400, 'Title, description, and category are required');
        }
        
        let attachmentUrl = null;
        
        // Check if a file is part of the request
        if (req.files && req.files.length > 0) {
            // Upload the file and get the URL
            console.log('Files:', req.files);
            const attachment = await uploadToAzure(req);
            attachmentUrl = attachment[0].filePath;
        }

        // Insert the announcement into the database
        const announcement = await sql`
            INSERT INTO announcements (title, user_id, message, category, attachment) 
            VALUES (${title}, ${user_id}, ${message}, ${category}, ${attachmentUrl}) 
            RETURNING *
        `;

        res.status(201).json(new ApiResponse(201, 'Announcement created successfully', announcement));
    } catch (error) {
        console.error('Error creating announcement:', error);
        return res.status(500).json(new ApiError(500, 'An error occurred while creating the announcement', [error.message]));
    }
};

export const updateAnnouncement = async(req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;
        console.log(id, fieldsToUpdate);
        // Validate inputs
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({message: 'ID and at least one field to update are required'});
        }

        // if there's a file in request, upload it to azure and update the file path
        if (req.files) {
            console.log('Files:', req.files);
            const upload = await uploadToAzure(req);
            const resourceUrl = upload[0].filePath;
            fieldsToUpdate.attachment = resourceUrl;
        }

        // Construct and execute the UPDATE query dynamically
        await sql`
          update announcements set ${
            sql(fieldsToUpdate, ...Object.keys(fieldsToUpdate))
          } where announcement_id = ${id}
        `;
        res.status(200).json(new ApiResponse(200, 'Announcement updated successfully'));
    } catch (error) {
        res.status(500).json(new ApiError(500, 'An error occurred while updating announcement', [error.message]));
    }
}


export const deleteAnnouncement = async(req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }
        await sql`DELETE FROM announcements WHERE announcement_id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Announcement deleted successfully'));
    } catch (error) {
        res.status(500).json(new ApiError(500, 'An error occurred while deleting announcement', [error.message]));
    }
}