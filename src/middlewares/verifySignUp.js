import sql from '../database/db.js';
import { ApiError } from '../utils/sendResponse.js';

export const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        const { username, email } = req.body;
        console.log(req.body);
        const user = await sql`SELECT * FROM users WHERE username = ${username}`;
        if (user.length) throw new ApiError(400, 'The username already exists');
        const userEmail = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (userEmail.length) return res.status(400).json(new ApiError(400, 'The email already exists'));
        next();
    } catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
}

export const checkTcioeEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const address = email.split('@').pop()
        if (address !== 'tcioe.edu.np') {
            throw new ApiError(400, 'Please use your TCIOE email');
        }
        next();
    } catch (error) { 
        return res.status(400).json(new ApiError(400, error.message, {
            hint: 'username@tcioe.edu.np'
        }));
    }
}

