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
        console.log(req.params);
        const semester = await sql`SELECT * FROM semesters WHERE semester_id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Semester fetched successfully', semester));
    } catch (error) {
        throw error;
    }
}


export const createSemester = async(req, res) => {
    try {
        console.log(req.body);
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

export const deleteSemester = async(req, res) => {
    try {
        const { id } = req.params;
        const deleted = await sql`DELETE FROM semesters WHERE semester_id = ${id}`;
        res.status(200).json(new ApiResponse(200, 'Semester deleted successfully', deleted));
    } catch (error) {
        throw error;
    }
}