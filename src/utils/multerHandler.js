import multer from 'multer';
import path from 'path';

const __dirname = path.resolve()

// file uploads are handles by multer 
const storage = multer.diskStorage({
    destination: (req, file, cback) => {
        // console.log("File", file)
        // directory to store the files
        /* ###################################
        Using Condition to check filetypes and uploading to specific folders needs to be implemented */
        cback(null, path.join(__dirname, '/public/uploads'));
    },
    filename: (req, file, cback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});



export const multerUploads = multer({ storage : storage })