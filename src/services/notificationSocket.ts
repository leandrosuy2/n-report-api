import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server | null = null;

export const initializeNotificationSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('👤 Usuário conectado ao socket de notificações');

        socket.on('disconnect', () => {
            console.log('👤 Usuário desconectado do socket de notificações');
        });
    });
};

export const emitNotification = (data: {
    userId: string;
    title: string;
    message: string;
}) => {
    if (!io) {
        console.error("❌ Socket.IO de notificações não inicializado!");
        return;
    }
    
    try {
        console.log("📡 Emitindo notificação:", data);
        // Envia a notificação apenas para o usuário específico
        io.to(data.userId).emit("notification", data);
        console.log("✅ Notificação emitida com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao emitir notificação:", error);
    }
}; 