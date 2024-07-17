import { ApiError } from "../utils/sendResponse.js";
import sql from "../database/db.js";

export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp_code, request_type=null } = req.body;
        if (!email || !otp_code) {
            throw new ApiError(400, 'Email and OTP code are required');
        }
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (user.length === 0) {
            throw new ApiError(400, 'User not found');
        }
        const user_otp = await sql`SELECT * FROM otp WHERE user_id = ${user[0].user_id} AND request_type = ${request_type} AND otp_code = ${otp_code}`;
        if (user_otp.length === 0) {
            throw new ApiError(400, 'Incorrect OTP');
        }
        if (user_otp[0].expires_at < new Date()) {
            throw new ApiError(400, 'OTP expired');
        }
        if (user_otp[0].otp_code === otp_code) {
            await sql`DELETE FROM otp WHERE user_id = ${user_id}`;
            next();
        }
        else {
            throw new ApiError(400, 'Invalid or expired OTP');
        }
    }
    catch (error) {
        return res.status(500).json(new ApiError(500, 'Failed to verify OTP', [error.message]));
    }
}
