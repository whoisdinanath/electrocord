import sql from '../database/db.js';

const getSubjects = async(req, res) => {
    try {
        const subjects = await sql`SELECT * FROM subjects`;
        res.status(200).json(subjects);
    } catch (error) {
        throw error;
    }
}

const getSubjectById = async(req, res) => {
    try {
        const { id } = req.params;
        const subject = await sql`SELECT * FROM subjects WHERE subject_id = ${id}`;
        res.status(200).json(subject);
    } catch (error) {
        throw error;
    }
}