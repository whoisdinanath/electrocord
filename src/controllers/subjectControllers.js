import sql from '../database/db.js';
import { ApiError, ApiResponse } from '../utils/sendResponse.js';
import { formatSubjects } from '../utils/formatMessage.js';

export const getSubjects = async(req, res) => {
    try {
        const data = await sql`SELECT s.subject_id, s.name, se.semester_id, se.semester, se.description, s.syllabus, s.description, c.id as chat_id, c.name, c.type, c.description, c.category, s.created_at, s.updated_at  FROM subjects s JOIN semesters se ON s.semester_id = se.semester_id JOIN chats c ON s.chat_id = c.id`;
        const subjects = formatSubjects(data);
        return res.status(200).json(new ApiResponse(200, 'Subjects fetched successfully', subjects));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while fetching subjects', [error.message]));
    }
}

export const getSubjectById = async(req, res) => {
    try {
        const { id } = req.params;
        const data = await sql`SELECT s.subject_id, s.name, se.semester_id, se.semester, se.description, s.syllabus, s.description, c.id as chat_id, c.name, c.type, c.description, c.category, s.created_at, s.updated_at  FROM subjects s JOIN semesters se ON s.semester_id = se.semester_id JOIN chats c ON s.chat_id = c.id WHERE s.subject_id = ${id}`;
        const subject = formatSubjects(data);
        return res.status(200).json(new ApiResponse(200, 'Subject fetched successfully', subject));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while fetching subject', [error.message]));
    }
}

export const createSubject = async(req, res) => {
    try {
        // ####################### TO BE UPDATED
        // ####################### ADDING OWN NAME & DESCRIPTION FROM BODY TO CHATS TABLE
        const { name, semester_id, syllabus = null, description =null} = req.body;
        console.log(req.body);
        if (!name || !semester_id || !syllabus || !description ) {
            return res.status(400).json({message: 'Name, Semester ID, Syllabus, Description are required'});
        }
        const result = await sql`INSERT INTO CHATS (name, type, description ,category) VALUES (${name}, 'text', ${description}, 'subject') RETURNING id`;
        const chat_id = result[0].id;

        const subject = await sql`INSERT INTO subjects (name, semester_id, syllabus, description, chat_id) VALUES (${name}, ${semester_id}, ${syllabus}, ${description}, ${chat_id}) RETURNING *`;
        return res.status(200).json(new ApiResponse(200, 'Subject created successfully', subject));
    } catch (error) {
        await sql`DELETE FROM chats WHERE id = ${chat_id}`;
        res.status(400).json(new ApiError(400, 'An error occurred while creating the subject', [error.message]));
    }
}

export const updateSubject = async(req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;

        // Validate inputs
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({message: 'ID and at least one field to update are required'});
        }

        // Construct and execute the UPDATE query dynamically
        await sql`
          update subjects set ${
            sql(fieldsToUpdate, ...Object.keys(fieldsToUpdate))
          }
          where subject_id = ${id}
        `;

        return res.status(200).json(new ApiResponse(200, 'Subject updated successfully'));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while updating the subject', [error.message]));
    }
}

export const deleteSubject = async(req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }
        await sql`DELETE FROM subjects WHERE subject_id = ${id}`;
        return res.status(200).json(new ApiResponse(200, 'Subject deleted successfully'));
    } catch (error) {
        return res.status(400).json(new ApiError(400, 'An error occurred while deleting the subject', [error.message]));
    }
}