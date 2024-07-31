import sql from '../database/db.js';
import { ApiError } from '../utils/sendResponse.js';

export const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        const { username, email } = req.body;

        // Validate required fields
        if (!username || !email) {
            throw new ApiError(400, 'Username and email are required');
        }

        // Check for existing username
        const [existingUser] = await sql`SELECT * FROM users WHERE username = ${username}`;
        if (existingUser) {
            if (existingUser.is_active) {
                throw new ApiError(400, 'Username already exists');
            } else {
                await sql`DELETE FROM users WHERE username = ${username}`;
            }
        }

        // Check for existing email
        const [existingEmailUser] = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existingEmailUser) {
            if (existingEmailUser.is_active) {
                throw new ApiError(400, 'Email already exists');
            } else {
                await sql`DELETE FROM users WHERE email = ${email}`;
            }
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(400).json(new ApiError(400, error.message));
    }
};


export const checkTcioeEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const address = email.split('@').pop()
        if (address !== 'tcioe.edu.np') {
            throw new ApiError(400, 'Please use your TCIOE email');
        }
        next();
    } catch (error) { 
        console.log(error);
        return res.status(400).json(new ApiError(400, error.message, {
            hint: 'username@tcioe.edu.np'
        }));
    }
}

