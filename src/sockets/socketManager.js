import { Server } from 'socket.io';
import { socketConnection } from './socketHandler.js'; // Adjust the path as necessary
import { authenticateSocket } from '../middlewares/socketAuth.js';

const allowedOrigins = [
    'https://sia-electrocord.vercel.app/',
    'http://localhost:3001',
    'http://localhost:3000',
    '*'
];

export const initializeSockets = (server) => {
    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                // allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);
                if (allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
            credentials: true
        }
    });

    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        socketConnection(socket, io);
    });
}
