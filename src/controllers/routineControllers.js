import sql from "../database/db.js";
import { ApiError, ApiResponse } from "../utils/sendResponse.js";

export const getRoutines = async (req, res) => {
    try {
        const routines = await sql`SELECT r.id, s.subject_id, s.name, s.semester_id, r.day, r.category, r.grp, r.teacher, r.start_time, r.end_time FROM routines r JOIN subjects s ON r.subject_id = s.subject_id`;
        return res.status(200).json(new ApiResponse(200, "Routines fetched successfully", routines));
    } catch (error) {
        res.status(400).json(new ApiError(400, "An error occurred while fetching routines", [error.message]));
    }
}

export const getRoutineById = async (req, res) => {
    try {
        const { id } = req.params;
        const routine = await sql`SELECT r.id, s.subject_id, s.name, s.semester_id, r.day, r.category, r.grp, r.teacher, r.start_time, r.end_time FROM routines r JOIN subjects s ON r.subject_id = s.subject_id WHERE id = ${id}`;
        return res.status(200).json(new ApiResponse(200, "Routine fetched successfully", routine));
    } catch (error) {
        res.status(400).json(new ApiError(400, "An error occurred while fetching routine", [error.message]));
    }
}


export const createRoutine = async (req, res) => {
    try {
        const { subject_id, day, grp, category, teacher, start_time, end_time, room_no= null } = req.body;

        if (!subject_id || !day || !grp || !category || !teacher || !start_time || !end_time) {
            return res.status(400).json({message: 'Subject ID, Day, Group, Category, Teacher, Start Time and End Time are required'});
        }
        const result = await sql`INSERT INTO routines (subject_id, day, grp, category, teacher, start_time, end_time) VALUES (${subject_id}, ${day}, ${grp}, ${category}, ${teacher}, ${start_time}, ${end_time}) RETURNING *`;

        return res.status(200).json(new ApiResponse(200, 'Routine created successfully', result));
    } catch (error) {
        res.status(400).json(new ApiError(400, 'An error occurred while creating the routine', [error.message]));
    }
}

export const updateRoutine = async (req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;

        if (!id || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({message: 'ID and at least one field to update are required'});
        }

        await sql`
          update routines set ${
            sql(fieldsToUpdate, ...Object.keys(fieldsToUpdate))
          }
          where id = ${id}
        `;

        return res.status(200).json({message: 'Routine updated successfully'});
    } catch (error) {
        return  res.status(400).json({message: 'An error occurred while updating the routine', error: error.message});
    }
}

export const deleteRoutine = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({message: 'ID is required'});
        }
        await sql`DELETE FROM routines WHERE id = ${id}`;
        return res.status(200).json({message: 'Routine deleted successfully'});
    } catch (error) {
        res.status(400).json(new ApiError(400, 'An error occurred while deleting the routine', [error.message]));
    }
}
