import sql from '../database/db.js'
import { ApiError, ApiResponse } from '../utils/sendResponse.js';

export const getSemesters = async (req, res) => {
    try {
        const semesters = await sql`SELECT * FROM semesters`;
        return res.status(200).json(new ApiResponse(200, 'Semesters fetched successfully', semesters));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while fetching semesters', [error.message]));
    }
}

export const getSemesterById = async (req, res) => {
    try {
        const { id } = req.params;
        const semester = await sql`SELECT * FROM semesters WHERE semester_id = ${id}`;
        return res.status(200).json(new ApiResponse(200, 'Semester fetched successfully', semester));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while fetching semester', [error.message]));
    }
}

export const createSemester = async (req, res) => {
    try {
        const { semester, description } = req.body;
        if (!semester || !description) {
            return res.status(400).json(new ApiError(400, 'Semester and Description are required'));
        }
        const created = await sql`INSERT INTO semesters (semester, description) VALUES (${semester}, ${description}) RETURNING *`;
        return res.status(200).json(new ApiResponse(200, 'Semester created successfully', created));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while creating the semester', [error.message]));
    }
}

export const updateSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json(new ApiError(400, 'ID and at least one field to update are required'));
        }
        await sql`
          update semesters set ${
            sql(fieldsToUpdate, ...Object.keys(fieldsToUpdate))
          }
          where semester_id = ${id} 
        `;
        return res.status(200).json(new ApiResponse(200, 'Semester updated successfully'));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while updating the semester', [error.message]));
    }
}

export const deleteSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await sql`DELETE FROM semesters WHERE semester_id = ${id}`;
        return res.status(200).json(new ApiResponse(200, 'Semester deleted successfully', deleted));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while deleting the semester', [error.message]));
    }
}
