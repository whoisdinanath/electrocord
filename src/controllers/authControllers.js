import sql from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const signUp = async (req, res) => {
    try {
        const { username, fullname, email, dob, password1, password2 } = req.body;
        if (password1 !== password2) return res.status(400).json({ message: 'Passwords do not match' });
        const hashedPassword = await bcrypt.hash(password1, 10);
        const newUser = await sql`INSERT INTO users (username, fullname, email, dob, password) VALUES (${username}, ${fullname}, ${email}, ${dob}, ${hashedPassword}) RETURNING *`;
        const token = jwt.sign({ id: newUser[0].id }, process.env.SECRET, { expiresIn: 86400 }); // token expiry : 1 day
        res.cookie('token', token, { 
            path: "/", // accesible from all path
            httpOnly: true, // can be accesed by client-side scripts
            maxAge: 86400000 
        }); /// cookie expires in a day
        // Note: Add secure=true during production
        res.status(200).json({ message: 'Signup successful' });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user.length) return res.status(404).json({ message: 'User Not Found' });
        const passwordIsValid = await bcrypt.compare(password, user[0].password);
        if (!passwordIsValid) return res.status(401).json({ message: 'Invalid Password' });
        const token = jwt.sign({ id: user[0].id }, process.env.SECRET, { expiresIn: 86400 });
        res.cookie('token', token, { 
            path: "/", // accesible from all path
            httpOnly: true, // can be accesed by client-side scripts
            maxAge: 86400000 
        }); /// cookie expires in a day
        // Note: Add secure=true during production
        res.status(200).json({ message: 'Signin successful'});
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}


export { signUp, signIn };