import sql from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiError, ApiResponse } from '../utils/sendResponse.js';

dotenv.config();

const signUp = async (req, res) => {
    try {
        const { username, fullname, email, dob, password1, password2, is_admin=false, is_moderator=false } = req.body;
        if (password1 !== password2) return res.status(400).json({ message: 'Passwords do not match' });
        const hashedPassword = await bcrypt.hash(password1, 10);
        const newUser = await sql`INSERT INTO users (username, fullname, email, dob, password, is_admin, is_moderator) VALUES (${username}, ${fullname}, ${email}, ${dob}, ${hashedPassword}, ${is_admin}, ${is_moderator}) RETURNING *`;
        const token = jwt.sign({ id: newUser[0].user_id }, process.env.SECRET, { 
        expiresIn: 86400 }); // token expiry : 1 day
        res.cookie('token', token, { 
            path: "/", // accesible from all path
            httpOnly: true, // can be accesed by client-side scripts
            maxAge: 86400000 
        }); /// cookie expires in a day
        // Note: Add secure=true during production
        res.status(200).json(new ApiResponse(200, 'User created successfully', newUser));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user.length) return res.status(404).json({ message: 'User Not Found' });
        const passwordIsValid = await bcrypt.compare(password, user[0].password);
        if (!passwordIsValid) return res.status(401).json({ message: 'Invalid Password' });
        const token = jwt.sign({ id: user[0].user_id }, process.env.SECRET, { expiresIn: 86400 });

        res.cookie('token', token, { 
            path: "/", // accesible from all path
            httpOnly: true, // can be accesed by client-side scripts
            maxAge: 86400000 
        }); /// cookie expires in a day
        // Note: Add secure=true during production
        res.status(200).json(new ApiResponse(200, 'User signed in successfully', user));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
}


export { signUp, signIn };