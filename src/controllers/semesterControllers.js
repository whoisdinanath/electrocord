import sql from '../database/db.js'

export const getSemesters = async(req, res) => {
    try {
        const semesters = await sql`SELECT * FROM semesters`;
        res.status(200).json(semesters);
    } catch (error) {
        throw error;
    }
}

export const getSemesterById = async(req, res) => {
    try {
        const { id } = req.params;
        console.log(req.params);
        const semester = await sql`SELECT * FROM semesters WHERE semester_id = ${id}`;
        res.status(200).json(semester);
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
        res.status(201).json(created);
    } catch (error) {
        throw error;
    }
}

export const deleteSemester = async(req, res) => {
    try {
        const { id } = req.params;
        const deleted = await sql`DELETE FROM semesters WHERE semester_id = ${id}`;
        res.status(200).json(deleted);
    } catch (error) {
        throw error;
    }
}