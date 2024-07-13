import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { ApiError, ApiResponse } from './sendResponse.js';

dotenv.config();

export const sendMail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
    
        const mailOptions = {
            from: process.env.MAIL_FROM,
            replyTo: process.env.MAIL_REPLYTO,
            to: to,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);

        return new ApiResponse(200, 'Email sent successfully', info);
    }
    catch (error) {
        console.log(error);
        return new ApiError(500, 'An error occurred while sending email', error.message);
    }
}




