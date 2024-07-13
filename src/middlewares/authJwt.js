import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sql from '../database/db.js';
import { ApiError } from '../utils/sendResponse.js';

export const verifyToken = async (req, res, next) => {
    dotenv.config();
    const { SECRET } = process.env;
    try {
        // Assuming the token is stored in a cookie named 'token'
        const token = req.cookies['token'];
        if (!token) { return res.status(403).json(new ApiError(403, 'No token provided')); }
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.user_id;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, 'Unauthorized');
        }
        return res.status(500).json(new ApiError(500, 'Failed to authenticate token'));
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        const [user] = await sql`SELECT * FROM users WHERE user_id = ${req.userId}`;
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        if (user.is_admin) {
            next();
        } else {
            throw new ApiError(403, 'Require Admin Role');
        }
    } catch (error) {
        console.error('isAdmin error:', error);
        res.status(500).json(new ApiError(500, 'Failed to verify admin status.'));
    }
};

export const isModerator = async (req, res, next) => {
    try {
        const [user] = await sql`SELECT * FROM users WHERE user_id = ${req.userId}`;
        if (user && user.is_moderator) {
            next();
        }
        res.status(403).json(new ApiError(403, 'Require Moderator Role'));
    }
    catch (error) {
        res.status(500).json(new ApiError(500, 'Failed to verify moderator status.'));
    }
}