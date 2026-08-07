import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

class SocketService {
  private io: SocketIOServer | null = null;

  public initialize(server: http.Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);
      socket.on("disconnect", () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });
  }

  public emit(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const socketService = new SocketService();
