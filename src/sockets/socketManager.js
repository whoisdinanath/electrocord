import { Server } from 'socket.io';
import { socketConnection } from './socketHandler.js'; // Adjust the path as necessary
import { authenticateSocket } from '../middlewares/socketAuth.js';

export const initializeSockets = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        },
    });

    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        socketConnection(socket, io);
    });
}