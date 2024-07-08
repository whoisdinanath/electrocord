import sql from "../database/db.js";
import { ApiError, ApiResponse } from "../utils/sendResponse.js";
import { uploadToAzure } from "../utils/azureUpload.js";

export const getResources = async (req, res) => {
    try {
        const resources = await sql`SELECT * FROM resources`;
        return res.status(200).json(new ApiResponse(200, "Resources fetched successfully", resources));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "An error occurred while fetching resources", [error.message]));
    }
}

export const getResourceById = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await sql`SELECT * FROM resources WHERE resource_id = ${id}`;
        return res.status(200).json(new ApiResponse(200, "Resource fetched successfully", resource));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "An error occurred while fetching resource", [error.message]));
    }
}

export const createResource = async (req, res) => {
    try{
        const { subject_id, name, description = null, category } = req.body;
        if (!subject_id || !name || !description || !category) {
            return res.status(400).json({message: 'Subject ID, Name, Description and Category are required'});
        }
        // this uploads the file to azure and returns the url to be saved in the database
        const upload = await uploadToAzure(req);
        // ######################## if multiple files are to be uploaded on one time change this logic, also need to add VARCHAR ARRAY IN DATABASE
        const resourceUrl = upload[0].url;
        console.log(resourceUrl);
        if (!resourceUrl) {
            return res.status(400).json({message: 'Error uploading resource'});
        }
        const result = await sql`INSERT INTO resources (subject_id, name, description, category, file_path ) VALUES (${subject_id}, ${name}, ${description}, ${category}, ${resourceUrl}) RETURNING *`;
        return res.status(201).json(new ApiResponse(201, 'Resource created successfully', result));
    }
    catch (error) {
        return res.status(500).json(new ApiError(500, 'An error occurred while creating the resource', [error.message]));
    }
}

export const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;    

        console.log(id, fieldsToUpdate);
        // validate the inputs 
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json(new ApiError(400, 'ID and at least one field to update are required'));
        }

        // if there's a file in request, upload it to azure and update the file path
        if (req.files) {
            const upload = await uploadToAzure(req);
            const resourceUrl = upload[0].url;
            fieldsToUpdate.file_path = resourceUrl;
        }

        await sql`
          update resources set ${
            sql(fieldsToUpdate, ...Object.keys(fieldsToUpdate))
          }
          where resource_id = ${id}
        `;
        return res.status(200).json(new ApiResponse(200, 'Resource updated successfully'));
    } catch (error) {
        throw error;
    } finally {
        return res.status(500).json(new ApiError(500, 'An error occurred while updating the resource', [error.message]));
    }
}

export const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }

        await sql`DELETE FROM resources WHERE resource_id = ${id}`;

        res.status(200).json({message: 'Resource deleted successfully'});
    } catch (error) {
        throw error;
    }

    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }
        await sql`DELETE FROM resources WHERE resource_id = ${id}`;
        return res.status(200).json(new ApiResponse(200, 'Resource deleted successfully'));
    }
    catch (error) {
        throw error;
    } finally {
        return res.status(500).json(new ApiError(500, 'An error occurred while deleting the resource', [error.message]));
    }
}
