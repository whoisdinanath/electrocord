import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

// router imports here
import homeRouter from './src/routes/homeRoutes.js';
import usersRouter from './src/routes/userRoutes.js';
import authRouter from './src/routes/authRoutes.js';
import semesterRouter from './src/routes/semesterRoutes.js';
import testRouter from './src/routes/testRoutes.js'
import chatRouter from './src/routes/chatRoutes.js';
import messageRouter from './src/routes/messageRoutes.js';
import subjectRouter from './src/routes/subjectRoutes.js';
import resourceRouter from './src/routes/resourceRoutes.js';
import routineRouter from './src/routes/routineRoutes.js';
import attachmentRouter from './src/routes/attachmentRoutes.js';

dotenv.config();

const app = express();
const SECRET = process.env.SECRET;
app.use(cookieParser(SECRET));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://sia-electrocord.vercel.app/'
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Accept'],
  credentials: true
};

// Apply CORS middleware before any other middleware or routes
app.use(cors(corsOptions));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// main url endpoints here
app.use('/', homeRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/semesters', semesterRouter);
app.use('/api/v1/test', testRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/subjects', subjectRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/routines', routineRouter);
app.use('/api/v1/attachments', attachmentRouter);

export default app;
