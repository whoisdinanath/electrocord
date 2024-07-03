import sql from '../database/db.js'
import { ApiError, ApiResponse } from '../utils/sendResponse.js';

export const getSemesters = async(req, res) => {
    try {
        const semesters = await sql`SELECT * FROM semesters`;
        res.status(200).json(new ApiResponse(200, 'Semesters fetched successfully', semesters));
    } catch (error) {
        throw error;
    }
}

export const getSemesterById = async(req, res) => {
    try {
        const { id } = req.params;
        const semester = await sql`SELECT * FROM semesters WHERE semester_id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Semester fetched successfully', semester));
    } catch (error) {
        throw error;
    }
}


export const createSemester = async(req, res) => {
    try {
        const {semester, description = null} = req.body;
        if (!semester  || !description) {
            return res.status(400).json({message: 'Semester and Description are required'});
        }
        const created = await sql`INSERT INTO semesters (semester, description) VALUES (${semester}, ${description})`;
        res.status(201).json(new ApiResponse(201, 'Semester created successfully', created));
    } catch (error) {
        throw error;
    }
}

export const updateSemester = async(req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;

        // Validate inputs
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({message: 'ID and at least one field to update are required'});
        }

        // Construct and execute the UPDATE query dynamically
        await sql`
          update semesters set ${
            sql(fieldsToUpdate, ...Object.keys(fieldsToUpdate))
          }
          where semester_id = ${id}
        `;

        res.status(200).json({message: 'Semester updated successfully'});
    } catch (error) {
        res.status(500).json({message: 'An error occurred while updating the semester', error: error.message});
    }
}

export const deleteSemester = async(req, res) => {
    try {
        const { id } = req.params;
        const deleted = await sql`DELETE FROM semesters WHERE semester_id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Semester deleted successfully', deleted));
    } catch (error) {
        throw error;
    }
}