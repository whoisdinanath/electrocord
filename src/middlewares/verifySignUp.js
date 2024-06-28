import sql from '../database/db.js';

export const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        const { username, email } = req.body;
        const user = await sql`SELECT * FROM users WHERE username = ${username}`;
        if (user.length) return res.status(400).json({ message: 'The username already exists' });
        const userEmail = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (userEmail.length) return res.status(400).json({ message: 'The email already exists' });
        next();
    } catch (error) {
        throw error;
    }
}

export const checkTcioeEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const address = email.split('@').pop()
        if (address !== 'tcioe.edu.np') {
            return res.status(400).json({message: 'You must use your edu email provided by the college.'});
        }
        next();
    } catch (error) {   
    }
}

