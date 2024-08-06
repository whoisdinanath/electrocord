import { Server } from 'socket.io';
import { socketConnection } from './socketHandler.js'; // Adjust the path as necessary
import { authenticateSocket } from '../middlewares/socketAuth.js';

const allowedOrigins = [
  'http://localhost:3000',  
  'http://localhost:3001',
  'http://localhost:3002',    
  'https://sia-electrocord.vercel.app',
  'https://sia-git-announcement-monoastros-projects.vercel.app',
  '*',
];

export const initializeSockets = (server) => {
    const io = new Server(server, {
        cors: {
            origin: function (origin, callback) {
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) 
	        {
                callback(null, true);
            }
	        else
	        {
                callback(new Error('Not allowed by CORS'));
            }
            },
            methods: 'GET,HEAD,OPTIONS,POST,PUT,DELETE',
            allowedHeaders: 'Origin, Content-Type, Accept, Authorization',
            credentials: true // Enable credentials
        }
    });

    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        socketConnection(socket, io);
    });
}
