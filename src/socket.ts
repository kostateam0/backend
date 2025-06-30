// socket.emit => 모든 클라이언트에게 메시지 전송
// socket.broadcast.emit => 모든 클라이언트에게 메시지 전송 (자신 제외)
// socket.to(socketId).emit => 특정 클라이언트에게 메시지 전송
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export default function SocketServer(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 연결됨:', socket.id);

    socket.on('joinChat', (roomId: string) => {
      socket.join(roomId);
      console.log(`🚪 ${socket.id} 방 ${roomId}에 입장`);
    });

    socket.on('sendMessage', (message) => {
      console.log(`💬 ${socket.id} 메시지 보냄:`, message);
      socket.broadcast.emit('messageReceived', message); // 자신 제외 전체에게 전송
    });

    socket.on('greet', ({ roomId, message }) => {
      console.log(`👋 ${socket.id} 방 ${roomId} 에서 말함: ${message}`);
      io.to(roomId).emit('greetResponse', `${socket.id}: ${message}`);
    });
  });
}
