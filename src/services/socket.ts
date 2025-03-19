import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
    console.log("🔄 Inicializando Socket.IO...");
    
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        transports: ['websocket', 'polling']
    });

    io.on("connection", (socket) => {
        console.log(`🔌 Cliente conectado: ${socket.id}`);

        // Log de todos os eventos recebidos
        socket.onAny((event, ...args) => {
            console.log(`📡 Evento recebido no servidor: ${event}`, args);
        });

        // Responder ao ping do cliente
        socket.on("ping", (callback) => {
            console.log(`🏓 Ping recebido de ${socket.id}`);
            if (typeof callback === 'function') {
                callback({ status: 'pong', timestamp: new Date().toISOString() });
            }
        });

        // Responder ao teste de conexão
        socket.on("test_connection", (data) => {
            console.log(`🔄 Teste de conexão recebido de ${socket.id}:`, data);
            socket.emit("connection_response", {
                status: "success",
                message: "Conexão estabelecida com sucesso!",
                receivedData: data,
                timestamp: new Date().toISOString()
            });
        });

        // Log de desconexão
        socket.on("disconnect", (reason) => {
            console.log(`❌ Cliente desconectado: ${socket.id}, Razão: ${reason}`);
        });

        // Log de erros
        socket.on("error", (error) => {
            console.error(`❌ Erro no socket ${socket.id}:`, error);
        });
    });

    // Log de erros globais do servidor
    io.on("error", (error) => {
        console.error("❌ Erro no servidor WebSocket:", error);
    });

    console.log("✅ Socket.IO inicializado com sucesso!");
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io não foi inicializado!");
    }
    return io;
};

export const emitOcurrence = (data: any) => {
    if (!io) {
        console.error("❌ Socket.IO não inicializado!");
        return;
    }
    
    try {
        console.log("📡 Emitindo nova ocorrência:", data);
        io.emit("newOcurrence", data);
        console.log("✅ Ocorrência emitida com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao emitir ocorrência:", error);
    }
}; 