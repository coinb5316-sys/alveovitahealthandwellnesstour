// backend/routes/socketRoutes.js
import { handleSocketConnection } from '../controllers/socketController.js';

export const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    handleSocketConnection(io, socket);
  });
  
  return io;
};