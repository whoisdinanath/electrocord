import sql from "../database/db.js";


export const socketConnection = (socket) => {
  console.log('A user connected', socket.id);

  // Handle "message" event
  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    // Broadcast to all clients except the sender
    socket.broadcast.emit('message', msg);
  });

  // Handle "disconnect" event
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
};