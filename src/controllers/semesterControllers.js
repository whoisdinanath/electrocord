import sql from '../database/db.js'
import { ApiError, ApiResponse } from '../utils/sendResponse.js';
import { formatSemesters } from '../utils/formatMessage.js';

export const getSemesters = async (req, res) => {
    try {
        const semesters = await sql`SELECT s.subject_id, s.name, r.resource_id, r.name as resource_name, r.description as resource_description, r.category as resource_category, r.file_path, r.created_at as resource_created, r.updated_at as resource_updated, se.semester_id, se.semester, se.description, s.syllabus, s.description, c.id as chat_id, c.name, c.type, c.description, c.category, s.created_at, s.updated_at  FROM subjects s JOIN semesters se ON s.semester_id = se.semester_id JOIN chats c ON s.chat_id = c.id LEFT JOIN resources r ON r.subject_id = s.subject_id`;
        const formattedSemesters = formatSemesters(semesters);
        return res.status(200).json(new ApiResponse(200, 'Semesters fetched successfully', formattedSemesters));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while fetching semesters', [error.message]));
    }
}

export const getSemesterById = async (req, res) => {
    try {
        const { id } = req.params;
        // get the semester and all subjects in that semester
        const semester = await sql`SELECT s.subject_id, s.name, r.resource_id, r.name as resource_name, r.description as resource_description, r.category as resource_category, r.file_path, r.created_at as resource_created, r.updated_at as resource_updated, se.semester_id, se.semester, se.description, s.syllabus, s.description, c.id as chat_id, c.name, c.type, c.description, c.category, s.created_at, s.updated_at  FROM subjects s JOIN semesters se ON s.semester_id = se.semester_id JOIN chats c ON s.chat_id = c.id LEFT JOIN resources r ON r.subject_id = s.subject_id WHERE se.semester_id = ${id}`;
        const formattedSemester = formatSemesters(semester);
        return res.status(200).json(new ApiResponse(200, 'Semester fetched successfully', formattedSemester));
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
