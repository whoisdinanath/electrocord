import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();
const { SECRET } = process.env;

export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) throw new Error('Unauthorized');
    const decoded = jwt.verify(token, SECRET);
    socket.userId = decoded.user_id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Unauthorized'));
    }
    return next(new Error('Failed to authenticate token.'));
  }
};
