import { ApiError } from "../utils/sendResponse.js";
import sql from "../database/db.js";

export const verifyOtp = async (req, res, next) => {
    try {
        const { user_id, otp_code, request_type } = req.body;
        const [user] = await sql`SELECT * FROM users WHERE user_id = ${user_id}`;
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        const user_otp = await sql`SELECT * FROM otp WHERE user_id = ${user_id} AND otp_code = ${otp_code} AND request_type = ${request_type}`;
        if (user_otp.length === 0) {
            throw new ApiError(400, 'Invalid or expired OTP');
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
