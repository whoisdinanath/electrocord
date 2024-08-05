import multer from 'multer';
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '/public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// File uploads are handled by multer
const storage = multer.diskStorage({
    destination: (req, file, cback) => {
        cback(null, uploadsDir);
    },
    filename: (req, file, cback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const multerUploads = multer({ storage: storage });