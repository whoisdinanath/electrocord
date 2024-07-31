import { ApiError } from "../utils/sendResponse.js";
import sql from "../database/db.js";

export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp_code, request_type = null } = req.body;

        // Validate required fields
        if (!email || !otp_code) {
            throw new ApiError(400, 'Email and OTP code are required');
        }

        // Check if user exists
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (user.length === 0) {
            throw new ApiError(404, 'User not found');
        }

        // Verify OTP
        const user_otp = await sql`SELECT * FROM otp WHERE email = ${email} AND request_type = ${request_type} AND otp_code = ${otp_code}`;
        if (user_otp.length === 0) {
            throw new ApiError(400, 'Incorrect OTP');
        }

        // Check if OTP has expired
        if (user_otp[0].expires_at < new Date()) {
            throw new ApiError(400, 'OTP expired');
        }

        // OTP is valid, proceed with next step
        await sql`DELETE FROM otp WHERE email = ${email} AND request_type = ${request_type}`;
        next();
    } catch (error) {
        return res.status(500).json(new ApiError(500, 'Failed to verify OTP', [error.message]));
    }
}

