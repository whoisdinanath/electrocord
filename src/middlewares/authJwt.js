import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sql from '../database/db.js';

export const verifyToken = async (req, res, next) => {
    dotenv.config();
    const { SECRET } = process.env;
    try {
        const token = req.headers['x-access-token'];
        if (!token) return res.status(403).json({ message: 'No token provided' });

        // Correctly handling jwt.verify synchronously
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Handle other errors differently if you like
        return res.status(500).json({ message: 'Failed to authenticate token.' });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        const [user] = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
        if (user && user.is_admin) {
            next();
            return;
        }
        res.status(403).json({ message: 'Require Admin Role' });
    }
    catch (error) {
        throw error;
    }
}

export const isModerator = async (req, res, next) => {
    try {
        const [user] = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
        if (user && user.is_moderator) {
            next();
            return;
        }
        res.status(403).json({ message: 'Require Moderator Role' });
    }
    catch (error) {
        throw error;
    }
}

