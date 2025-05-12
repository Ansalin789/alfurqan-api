import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import AppLogger from "../helpers/logging";

let ioConnection: SocketIOServer | null = null;

// ✅ Initialize Socket.IO with HTTP server
export const initializeSocket = (httpServer: HttpServer): void => {
  ioConnection = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  ioConnection.on("connection", (socket: Socket) => {
    AppLogger.info(`🔌 User connected - Socket ID: ${socket.id}`);
  
    socket.on("subscribe", (userId: string) => {
      socket.join(userId);
      AppLogger.info(`👤 User with Socket ID: ${socket.id} joined room: ${userId}`);
    });
  
    socket.on("disconnect", () => {
      AppLogger.info(`❌ Disconnected - Socket ID: ${socket.id}`);
    });
  });
  
};

// ✅ Safe getter for io instance (instead of exporting mutable variable)
export const getIO = (): SocketIOServer => {
  if (!ioConnection) {
    throw new Error("Socket.IO not initialized");
  }
  return ioConnection;
};

// ✅ Emit to user or globally
export const emitEventToClient = (event: string, data: any, userId?: string): void => {
  try {
    const io = getIO();
    if (userId) {
      io.to(userId).emit(event, data);
      AppLogger.info(`📡 Event '${event}' sent to userId: ${userId} - Data: ${JSON.stringify(data)}`);
    } else {
      io.emit(event, data);
      AppLogger.info(`📡 Global emit for event '${event}' - Data: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    AppLogger.error(`🚨 Failed to emit event: ${(err as Error).message}`);
  }
};
