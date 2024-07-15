import sql from "../database/db.js";
import { ApiResponse } from "../utils/sendResponse.js";

export const homePage = async (req, res) => {
    const data = {
        title: 'Electrocord API',
        message: 'Welcome to Electrocord API'
    }
    return res.status(200).json(new ApiResponse(200, 'Welcome to Electrocord API', data));
}