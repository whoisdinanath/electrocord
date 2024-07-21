import sql from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiError, ApiResponse } from '../utils/sendResponse.js';
import { sendMail } from '../utils/sendMail.js';
import { generateOtp } from '../utils/generateOtp.js';
import { uploadToAzure } from '../utils/azureUpload.js';

dotenv.config();

const signUp = async (req, res) => {
    try {
        const { username, fullname, email, dob, password1, password2, is_admin=false, is_moderator=false } = req.body; // get the user details from the request body
        if (!username || !fullname || !email || !dob || !password1 || !password2) throw new ApiError(400, 'username, fullname, email, dob, password1, password2 are required');
        if (password1 !== password2) throw new ApiError(400, 'Passwords do not match'); 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password1, salt); // hash the password
        let profile_url = null;

        // setting default profile picture if no file is uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            profile_url = 'https://github.com/monoastro/sia/blob/main/public/static/emma.svg';
        }
        else{
            // uploads the profile picture to azure storage
            const uploadedFile = await uploadToAzure(req.files.profile_pic);
            if (!uploadedFile) throw new ApiError(400, 'Profile picture not uploaded');
            // get the profile picture url
            profile_url = uploadedFile[0].filePath;
        }
        // creating a new user
        const newUser = await sql`INSERT INTO users (username, fullname, email, dob, password, profile_pic, is_admin, is_moderator) VALUES (${username}, ${fullname}, ${email}, ${dob}, ${hashedPassword}, ${profile_url} ,${is_admin}, ${is_moderator}) RETURNING user_id, username, email, dob, profile_pic, is_admin`;
        // if user is not created, throw an error
        if (!newUser || !newUser.length === 0) throw new Error('User not created');
        // generate an OTP for account activation
        const otp = generateOtp(username, newUser[0].user_id);
        const user_otp = await sql`INSERT INTO otp (user_id, otp_code, request_type) VALUES (${newUser[0].user_id}, ${otp}, 'signup') RETURNING *`;

        // details to be sent in the email along with otp
        const subject = 'Account Verification';
        const html = `<p>Hi <strong>${username}</strong>,</p><p>Use this OTP to activate your account: <strong>${otp}</strong></p> <p>Regards, <br> Team Electrocord</p>`;

        // send the email
        const mail = await sendMail(email, subject, html);

        // if email is not sent, throw an error
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
        const { email } = req.body;
        if (!email) throw new ApiError(400, 'Email is required');
        // set the is_active field to true to activate the account, verification done in middleware
        const user = await sql`UPDATE users SET is_active = true WHERE email = ${email} RETURNING user_id, username, email, is_admin, is_active`;
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

        // generate an OTP for password reset
        const otp = generateOtp(username, user_id);
        const user_otp = await sql`INSERT INTO otp (user_id, otp_code, request_type) VALUES (${user_id}, ${otp}, 'reset') RETURNING *`;
        if (!user_otp || !user_otp.length === 0) throw new ApiError(400, 'OTP not generated');
        const subject = 'Password Reset';
        const html = `<p>Hi <strong>${username}</strong>,</p><p>Use this OTP to reset your password: <strong>${otp}</strong></p> <p>Regards, <br> Team Electrocord</p>`;

        // send password reset email
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
        const { email, request_type } = req.body;
        if (!email || !request_type) throw new ApiError(400, 'email and request_type are required');
        const user =  await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user || !user.length === 0) throw new ApiError(404, 'User not found');
        if (request_type === 'signup' && user[0].is_active) throw new ApiError(400, 'Account already activated');
        const { user_id, username } = user[0];
        const otpExists = await sql`SELECT * FROM otp WHERE user_id = ${user_id} AND request_type = ${request_type}`;
        if (!otpExists || !otpExists.length === 0) throw new ApiError(400, 'Not a valid request');
        const otp = generateOtp(username, user_id);
        const user_otp = await sql`UPDATE otp SET otp_code = ${otp} WHERE user_id = ${user_id} AND request_type = ${request_type} RETURNING *`;
        if (!user_otp || !user_otp.length === 0) throw new ApiError(400, 'OTP not regenerated');
        const subject = 'Account Verification';
        let html;
        if (request_type === 'signup') {
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
        const { email, old_password=null, password1, password2, request_type=null, otp_code=null } = req.body;
        if (!email || !password1 || !password2 || !request_type) throw new ApiError(400, 'email, password1, password2, request_type are required');
        if (request_type === 'reset' && !otp_code) throw new ApiError(400, 'Password reset OTP is required');
        if (password1 !== password2) throw new ApiError(400, 'Passwords do not match');
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user || !user.length === 0) throw new ApiError(404, 'User not found');
        if (request_type === 'reset') {
            const user_otp = await sql`SELECT * FROM otp WHERE user_id = ${user[0].user_id} AND request_type = ${request_type}`;
            if (user_otp.length === 0) throw new ApiError(400, `Invalid ${request_type} request`);
            if (user_otp[0].otp_code !== otp_code) throw new ApiError(400, 'Invalid OTP');
        }
        if (request_type === 'change') {
            const passwordIsValid = await bcrypt.compare(old_password, user[0].password);
            if (!passwordIsValid) throw new ApiError(401, 'Invalid Password');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password1, salt);
        const updatedUser = await sql`UPDATE users SET password = ${hashedPassword} WHERE email = ${email} RETURNING user_id, username, email, is_admin, is_active`;
        if (!updatedUser || !updatedUser.length) throw new ApiError(400, 'Password not updated');
        await sql`DELETE FROM otp WHERE user_id = ${user[0].user_id}`;
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
        if (!user.length) throw new ApiError(404, 'User not found');
        if (!user[0].is_active) throw new ApiError(401, 'Account not activated');
        const passwordIsValid = await bcrypt.compare(password, user[0].password);
        if (!passwordIsValid) throw new ApiError(401, 'Invalid Password');
        const token = jwt.sign({ user_id: user[0].user_id, 
            email: user[0].email,
            username: user[0].username,
            dob: user[0].dob,
            is_admin: user[0].is_admin,
            // is_moderator: user[0].is_moderator,
            profile_pic: user[0].profile_pic
         }, process.env.SECRET, { expiresIn: 86400 });

		try{
			res.cookie('token', token,  {
				httpOnly: true,
				maxAge: 24*60*60*1000,  
				secure: true,
				sameSite: 'None',
                signed: true
			});
		} catch(err){console.log(err);}
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
