import sql from '../database/db.js';
import { ApiError, ApiResponse } from '../utils/sendResponse.js';

export const getSubjects = async(req, res) => {
    try {
        const subjects = await sql`SELECT * FROM subjects`;
        res.status(200).json(new ApiResponse(200, 'Subjects fetched successfully', subjects));
    } catch (error) {
        throw error;
    }
}

export const getSubjectById = async(req, res) => {
    try {
        const { id } = req.params;
        const subject = await sql`SELECT * FROM subjects WHERE subject_id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Subject fetched successfully', subject));
    } catch (error) {
        throw error;
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
        res.status(201).json(new ApiResponse(201, 'Subject created successfully', subject));
    } catch (error) {
        throw error;
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

        res.status(200).json({message: 'Subject updated successfully'});
    } catch (error) {
        res.status(500).json({message: 'An error occurred while updating the subject', error: error.message});
    }
}

export const deleteSubject = async(req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }
        await sql`DELETE FROM subjects WHERE subject_id = ${id}`;
        res.status(200).json({message: 'Subject deleted successfully'});
    } catch (error) {
        res.status(500).json({message: 'An error occurred while deleting the subject', error: error.message});
    }
}