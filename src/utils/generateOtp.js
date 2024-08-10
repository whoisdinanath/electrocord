import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const getTimestampInSeconds = () => {
  return Math.floor(new Date().getTime() / 1000);
};

export const generateOtp = (username, id) => {
  const timestamp = getTimestampInSeconds();
  // const secret = process.env.OTP_SECRET || 'default_secret'; // Fallback secret
  const secret = process.env.SECRET;
  const baseString = `${username}_${id}_${timestamp}_${secret}`;
  const hash = bcrypt.hashSync(baseString, 10);
  // Convert the hash to a large integer using a simple hash function
  let hashValue = 0;
  for (let i = 0; i < hash.length; i++) {
    hashValue = 31 * hashValue + hash.charCodeAt(i);
  }
  // Ensure the result is a 6-digit positive integer
  const otp = Math.abs(hashValue) % 1000000;
  // Ensure the OTP is 6 digits by padding with zeros if necessary
  return otp.toString().padStart(6, '0');
};