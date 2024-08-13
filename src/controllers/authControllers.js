import sql from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiError, ApiResponse } from '../utils/sendResponse.js';
import { sendMail } from '../utils/sendMail.js';
import { generateOtp } from '../utils/generateOtp.js';
import { uploadToAzure } from '../utils/azureUpload.js';

dotenv.config();

const adminEmail1 = process.env.ADMIN_EMAIL;
const adminEmail2 = process.env.ADMIN_EMAIL2;
const adminEmail3 = process.env.ADMIN_EMAIL3;

const signUp = async (req, res) => {
    try {
        const { username, fullname, email, dob, password1, password2 } = req.body;

        // Validate required fields
        if (!username || !fullname || !email || !dob || !password1 || !password2) {
            throw new ApiError(400, 'username, fullname, email, dob, password1, password2 are required');
        }

        if (password1.length < 6) {
            throw new ApiError(400, 'Password must be at least 6 characters');
        }

        //username must be alphanumeric
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            throw new ApiError(400, 'Username must be alphanumeric');
        }

        // Validate password match
        if (password1 !== password2) {
            throw new ApiError(400, 'Passwords do not match');
        }

        // Determine admin status based on email
        let isAdmin = false;
        let isModerator = false;
        if ([adminEmail1, adminEmail2, adminEmail3].includes(email)) {
            isAdmin = true;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password1, salt);

        // Set default profile picture if no file is uploaded
        let profile_url;
        if (req.files && Object.keys(req.files).length > 0) {
            console.log('Files:', req.files);
            const uploadedFile = await uploadToAzure(req);
            if (!uploadedFile) throw new ApiError(400, 'Profile picture not uploaded');
            profile_url = uploadedFile[0].filePath;
        } else {
            profile_url = 'https://raw.githubusercontent.com/monoastro/sia/main/public/static/emma.svg';
        }


        // Create new user
        const newUser = await sql`
            INSERT INTO users (username, fullname, email, dob, password, profile_pic, is_admin, is_moderator, is_active)
            VALUES (${username}, ${fullname}, ${email}, ${dob}, ${hashedPassword}, ${profile_url}, ${isAdmin}, ${isModerator}, false)
            RETURNING user_id, username, email, dob, profile_pic, is_admin
        `;
        if (!newUser || newUser.length === 0) throw new Error('User not created');

        // Generate or reuse OTP for account activation
        let otp;
        const otpExists = await sql`SELECT * FROM otp WHERE email = ${newUser[0].email} AND request_type = 'signup'`;
        if (otpExists.length !== 0 && otpExists[0].expires_at > new Date()) {
            otp = otpExists[0].otp_code;
        } else {
            if (otpExists.length !== 0) {
                await sql`DELETE FROM otp WHERE email = ${newUser[0].email} AND request_type = 'signup'`;
            }
            otp = generateOtp(newUser[0].username, newUser[0].user_id);
            await sql`INSERT INTO otp (user_id, email, otp_code, request_type) VALUES (${newUser[0].user_id}, ${newUser[0].email}, ${otp}, 'signup') RETURNING *`;
        }

        // Email details
        const subject = 'Account Verification';
        const html = `<p>Hi <strong>${username}</strong>,</p><p>Use this OTP to activate your account: <strong>${otp}</strong></p><p>Regards,<br>Team Electrocord</p>`;

        // Send the email
        const mail = await sendMail(email, subject, html);
        if (mail.status === 'error') throw new Error(mail.message);

        return res.status(200).json(new ApiResponse(200, 'User created successfully, OTP sent to your email', { user: newUser }));
    } catch (error) {
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
        if (!user.length === 0 && user[0].is_active) throw new ApiError(400, 'Account not activated');
        return res.status(200).json(new ApiResponse(200, 'Account activated successfully', user));
    }
    catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate input
        if (!email) {
            throw new ApiError(400, 'Email is required');
        }

        // Fetch the user by email
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user || user.length === 0) {
            throw new ApiError(404, 'User not found');
        }
        const { username, user_id } = user[0];

        // Check for existing OTPs
        const otpExists = await sql`SELECT * FROM otp WHERE email = ${email} AND request_type = 'reset'`;

        let otp;
        if (otpExists.length > 0) {
            // If OTP exists and is unexpired, reuse it
            const existingOtp = otpExists[0];
            if (existingOtp.expires_at > new Date()) {
                otp = existingOtp.otp_code;
            } else {
                // If OTP is expired, delete it and generate a new one
                await sql`DELETE FROM otp WHERE email = ${email} AND request_type = 'reset'`;
                otp = generateOtp(username, user_id);
                await sql`INSERT INTO otp (user_id, email, otp_code, request_type, expires_at) VALUES (${user_id}, ${email}, ${otp}, 'reset', ${new Date(Date.now() + 15 * 60 * 1000)}) RETURNING *`;
            }
        } else {
            // If no OTP exists, generate a new one
            otp = generateOtp(username, user_id);
            await sql`INSERT INTO otp (user_id, email, otp_code, request_type, expires_at) VALUES (${user_id}, ${email}, ${otp}, 'reset', ${new Date(Date.now() + 15 * 60 * 1000)}) RETURNING *`;
        }

        // Email details
        const subject = 'Password Reset';
        const html = `<p>Hi <strong>${username}</strong>,</p><p>Use this OTP to reset your password: <strong>${otp}</strong></p><p>Regards,<br>Team Electrocord</p>`;

        // Send password reset email
        const mail = await sendMail(email, subject, html);
        if (mail.status === 'error') {
            throw new Error(mail.message);
        }

        return res.status(200).json(new ApiResponse(200, 'OTP sent to your email'));
    } catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
};


const regenerateOtp = async (req, res) => {
    try {
        const { email, request_type } = req.body;
        if (!email || !request_type) throw new ApiError(400, 'Email and request_type are required');

        // Check if user exists
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user || user.length === 0) throw new ApiError(404, 'User not found');
        
        // Check if account is already activated for signup request
        if (request_type === 'signup' && user[0].is_active) throw new ApiError(400, 'Account already activated');

        const { user_id, username } = user[0];

        // Check if OTP exists for the request type
        const otpExists = await sql`SELECT * FROM otp WHERE user_id = ${user_id} AND request_type = ${request_type}`;

        let otp;
        // If OTP exists and is still valid, reuse it
        if (otpExists.length !== 0 && otpExists[0].expires_at > new Date()) {
            otp = otpExists[0].otp_code;
        } else {
            // Otherwise, delete any existing OTP and generate a new one
            if (otpExists.length !== 0) {
                await sql`DELETE FROM otp WHERE user_id = ${user_id} AND request_type = ${request_type}`;
            }
            otp = generateOtp(username, user_id);

            // Insert new OTP
            const user_otp = await sql`INSERT INTO otp (user_id, email, otp_code, request_type) VALUES (${user_id}, ${email}, ${otp}, ${request_type}) RETURNING *`;
            if (!user_otp || user_otp.length === 0) throw new ApiError(400, 'OTP not regenerated');
        }

        // Prepare email content
        const subject = request_type === 'signup' ? 'Account Verification' : 'Password Reset';
        const html = `<p>Hi <strong>${username}</strong>,</p><p>Use this OTP to ${request_type === 'signup' ? 'activate your account' : 'reset your password'}: <strong>${otp}</strong></p><p>Regards,<br>Team Electrocord</p>`;

        // Send email
        const mail = await sendMail(email, subject, html);
        if (mail.status === 'error') throw new Error(mail.message);

        return res.status(200).json(new ApiResponse(200, 'OTP regenerated successfully'));
    } catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
};



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
            if (!passwordIsValid) throw new ApiError(400, 'Invalid old Password');
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
        console.log(email);
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user.length) throw new ApiError(404, 'User not found');
        if (!user[0].is_active) throw new ApiError(400, 'Account not activated');
        const passwordIsValid = await bcrypt.compare(password, user[0].password);
        if (!passwordIsValid) throw new ApiError(400, 'Invalid Password');
        const token = jwt.sign({ user_id: user[0].user_id, 
            email: user[0].email,
            username: user[0].username,
            dob: user[0].dob,
            is_admin: user[0].is_admin,
            // is_moderator: user[0].is_moderator,
            profile_pic: user[0].profile_pic
         }, process.env.SECRET, { expiresIn: 86400*10 });

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
        return res.status(400).json(new ApiError(400, error.message));
    }
}



export { signUp, signIn, activateAccount, regenerateOtp, resetPassword, changePassword };
