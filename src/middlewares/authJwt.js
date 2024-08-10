import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sql from '../database/db.js';
import { ApiError } from '../utils/sendResponse.js';

dotenv.config();

export const verifyToken = async (req, res, next) => {
    const { SECRET } = process.env;
    try {
        const {token} = req.signedCookies;
        if (!token)
		{
            return res.status(403).json(new ApiError(403, 'No token provided'));
        }
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.user_id;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json(new ApiError(401, 'Unauthorized'));
        }
        return res.status(500).json(new ApiError(500, 'Failed to authenticate token'));
    }
};

export const isAdmin = async (req, res, next) => {
    console.log('isAdmin:', req.userId);
    try {
        const [user] = await sql`SELECT * FROM users WHERE user_id = ${req.userId}`;

        if (!user) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }
        if (user.is_admin) {
            next();
        } else {
            return res.status(403).json(new ApiError(403, 'Require Admin Role'));
        }
    } catch (error) {
        return res.status(500).json(new ApiError(500, 'Failed to verify admin status.'));
    }
};

export const isModerator = async (req, res, next) => {
    try {
        const [user] = await sql`SELECT * FROM users WHERE user_id = ${req.userId}`;
        if (!user) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }
        if (user.is_moderator) {
            next();
        } else {
            return res.status(403).json(new ApiError(403, 'Require Moderator Role'));
        }
    } catch (error) {
        return res.status(500).json(new ApiError(500, 'Failed to verify moderator status.'));
    }
};

export const verifySelf = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [user] = await sql`SELECT * FROM users WHERE user_id = ${id}`;
        if (!user) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }
        if (id !== req.userId && !user.is_admin) {
            return res.status(403).json(new ApiError(403, 'Unauthorized'));
        }
        req.is_admin = user.is_admin;
        console.log('verifySelf:', req.is_admin);
        next();
    } catch (error) {
        console.error('verifySelf error:', error);
        return res.status(500).json(new ApiError(500, 'Failed to verify user'));
    }
};
