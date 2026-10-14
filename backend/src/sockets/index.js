import { Server } from 'socket.io';
import { config } from '../config/index.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, { cors: { origin: config.frontendOrigins } });

  io.on('connection', (socket) => {
    console.log(`[socket] cliente conectado (${socket.id})`);
    socket.on('disconnect', () => console.log(`[socket] cliente desconectado (${socket.id})`));
  });

  return io;
};

// Eventos documentados en docs/API.md (sección Socket.IO).
export const emit = (event, payload) => io?.emit(event, payload);
