import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sql from '../database/db.js';

const verifyToken = async (req, res, next) => {
    dotenv.config();
    const { SECRET } = process.env;
    try {
        const token = req.headers['x-access-token'];
        if (!token) return res.status(403).json({ message: 'No token provided' });
        const decoded = jwt.verify(token, SECRET, (err, decoded) => {
            if (err) return res.status(401).json({ message: 'Unauthorized' });
            return decoded; });
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        throw error;
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
        if (user[0].is_admin) {
            next();
            return;
        }
        res.status(403).json({ message: 'Require Admin Role' });
    }
    catch (error) {
        throw error;
    }
}

const isModerator = async (req, res, next) => {
    try {
        const user = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
        if (user[0].is_moderator) {
            next();
            return;
        }
        res.status(403).json({ message: 'Require Moderator Role' });
    }
    catch (error) {
        throw error;
    }
}

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator
}

export default authJwt;

