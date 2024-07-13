import sql from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiError, ApiResponse } from '../utils/sendResponse.js';
import { sendMail } from '../utils/sendMail.js';
import { generateOtp } from '../utils/generateOtp.js';

dotenv.config();

const signUp = async (req, res) => {
    try {
        const { username, fullname, email, dob, password1, password2, is_admin=false, is_moderator=false } = req.body;
        if (password1 !== password2) return res.status(400).json({ message: 'Passwords do not match' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password1, salt);
        const newUser = await sql`INSERT INTO users (username, fullname, email, dob, password, is_admin, is_moderator) VALUES (${username}, ${fullname}, ${email}, ${dob}, ${hashedPassword}, ${is_admin}, ${is_moderator}) RETURNING user_id, username, email, is_admin`;
        // Note: Add secure=true during production
        if (!newUser || !newUser.length === 0) throw new Error('User not created');
        const otp = generateOtp(username, newUser[0].user_id);
        const user_otp = await sql`INSERT INTO otp (user_id, otp_code, request_type) VALUES (${newUser[0].user_id}, ${otp}, 'signup') RETURNING *`;
        const subject = 'Account Verification';
        const html = `<p>Hi <strong>${username}</strong>,</p><p>Use this OTP to activate your account: <strong>${otp}</strong></p> <p>Regards, <br> Team Electrocord</p>`;
        const mail = await sendMail(email, subject, html);
        if (mail.status === 'error') throw new Error(mail.message);
        return res.status(201).json(new ApiResponse(201, 'User created successfully, OTP sent to your email', {
            user: newUser
        }));
    }    
    catch (error) {
        await sql`DELETE FROM users WHERE email = ${req.body.email}`;
        return res.status(400).json(new ApiError(400, error.message));
    }
};

const activateAccount = async (req, res) => {
    try {
        const { user_id } = req.body;
        const user = await sql`UPDATE users SET is_active = true WHERE user_id = ${user_id} RETURNING user_id, username, email, is_admin, is_active`;
        if (!user || !user.length === 0) throw new Error('Account not activated');
        return res.status(200).json(new ApiResponse(200, 'Account activated successfully', user));
    }
    catch (error) {
        console.log(error);
        return res.status(400).json(new ApiError(400, error.message));
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user || !user.length === 0) throw new ApiError(404, 'User not found');
        const { username, user_id } = user[0];
        const otp = generateOtp(username, user_id);
        const user_otp = await sql`INSERT INTO otp (user_id, otp_code, request_type) VALUES (${user_id}, ${otp}, 'reset') RETURNING *`;
        if (!user_otp || !user_otp.length === 0) throw new ApiError(400, 'OTP not generated');
        const subject = 'Password Reset';
        const html = `<p>Hi <strong>${username}</strong>,</p><p>Use this OTP to reset your password: <strong>${otp}</strong></p> <p>Regards, <br> Team Electrocord</p>`;
        const mail = await sendMail(email, subject, html);
        if (mail.status === 'error') throw new Error(mail.message);
        return res.status(200).json(new ApiResponse(200, 'OTP sent to your email'));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
}


const regenerateOtp = async (req, res) => {
    try {
        const { user_id, req_type } = req.body;
        const user =  await sql`SELECT * FROM users WHERE user_id = ${user_id}`;
        if (!user || !user.length === 0) throw new ApiError(404, 'User not found');
        if (req_type === 'signup' && user[0].is_active) throw new ApiError(400, 'Account already activated');
        const { username, email } = user[0];
        const otp = generateOtp(username, user_id);
        const user_otp = await sql`UPDATE otp SET otp_code = ${otp} WHERE user_id = ${user_id} AND request_type = ${req_type} RETURNING *`;
        if (!user_otp || !user_otp.length === 0) throw new ApiError(400, 'OTP not regenerated');
        const subject = 'Account Verification';
        let html;
        if (req_type === 'signup') {
            html = `<p>Hi <strong>${username}</strong>,</p><p>Use this OTP to activate your account: <strong>${otp}</strong></p> <p>Regards, <br> Team Electrocord</p>`;
            
        }
        else {
            html = `<p>Hi <strong>${username}</strong>,</p><p>Use this OTP to reset your password: <strong>${otp}</strong></p> <p>Regards, <br> Team Electrocord</p>`;
        }
        const mail = await sendMail(email, subject, html);
        if (mail.status === 'error') throw new Error(mail.message);
        return res.status(200).json(new ApiResponse(200, 'OTP regenerated successfully'));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
}


const changePassword = async (req, res) => {
    try {
        const { user_id, password1, password2, request_type=null, otp=null } = req.body;
        if (password1 !== password2) throw new ApiError(400, 'Passwords do not match');
        const user = await sql`SELECT * FROM users WHERE user_id = ${user_id}`;
        if (!user || !user.length === 0) throw new ApiError(404, 'User not found');
        if (request_type === 'reset') {
            const user_otp = await sql`SELECT * FROM otp WHERE user_id = ${user_id} AND otp_code = ${otp} AND request_type = ${request_type}`;
            if (!user_otp || !user_otp.length === 0) throw new ApiError(400, 'Invalid or expired OTP, regenerate the OTP and try again');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password1, salt);
        const updatedUser = await sql`UPDATE users SET password = ${hashedPassword} WHERE user_id = ${user_id} RETURNING user_id, username, email, is_admin, is_active`;
        if (!updatedUser || !updatedUser.length === 0) throw new ApiError(400, 'Password not updated');
        return res.status(200).json(new ApiResponse(200, 'Password updated successfully', updatedUser));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
}


const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user.length) return res.status(404).json(new ApiError(404, 'User not found'));
        const passwordIsValid = await bcrypt.compare(password, user[0].password);
        if (!passwordIsValid) return res.status(401).json(new ApiError(401, 'Invalid Password'));
        const token = jwt.sign({ user_id: user[0].user_id, 
            email: user[0].email,
            username: user[0].username,
            is_admin: user[0].is_admin,
            is_moderator: user[0].is_moderator,
            profile_pic: user[0].profile_pic
         }, process.env.SECRET, { expiresIn: 86400 });

        res.cookie('token', token, { 
            path: "/", // accesible from all path
            httpOnly: true, // can be accesed by client-side scripts
            maxAge: 86400000,
            secure: true,
            // signed: true, // unable to parse cookie using this currently
            SameSite: 'None'
        }); /// cookie expires in a day
        // Note: Add secure=true during production
        const tokenDetails = {
            token,
            expiresIn: 86400
        }
        return res.status(200).json(new ApiResponse(200, 'User signed in successfully', tokenDetails));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, 'Signin failed', [error.message]));
    }
}


export { signUp, signIn, activateAccount, regenerateOtp, resetPassword, changePassword };