import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sql from '../database/db.js';

export const verifyToken = async (req, res, next) => {
    dotenv.config();
    const { SECRET } = process.env;
    try {
        // Assuming the token is stored in a cookie named 'token'
        const token = req.cookies['token'];
        if (!token) return res.status(403).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, SECRET);
        console.log(decoded.id)
        req.userId = decoded.id;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.status(500).json({ message: 'Failed to authenticate token.' });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        const [user] = await sql`SELECT * FROM users WHERE user_id = ${req.userId}`;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.is_admin) {
            next();
        } else {
            return res.status(403).json({ message: 'Require Admin Role!' });
        }
    } catch (error) {
        console.error('isAdmin error:', error);
        res.status(500).json({ message: 'Failed to verify admin status.' });
    }
};

export const isModerator = async (req, res, next) => {
    try {
        const [user] = await sql`SELECT * FROM users WHERE user_id = ${req.userId}`;
        if (user && user.is_moderator) {
            next();
            return;
        }
        res.status(403).json({ message: 'Require Moderator Role' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to verify moderator status.' });
    }
}