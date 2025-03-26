import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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

        // Autenticação do socket
        socket.on("authenticate", async (data) => {
            const { userId, token } = data;
            if (!userId || !token) {
                socket.disconnect();
                return;
            }
            socket.data.userId = userId;
        });

        // Junta o socket a um chat específico
        socket.on("join_chat", async (data) => {
            const { chatId } = data;
            if (!chatId) return;

            try {
                const chat = await prisma.chat.findUnique({
                    where: { id: chatId },
                    include: { ocurrence: true }
                });

                if (!chat || chat.ocurrence.resolved) {
                    socket.emit("error", { message: "Chat não encontrado ou fechado" });
                    return;
                }

                socket.join(chatId);
                socket.emit("chat_joined", { chatId });
            } catch (error) {
                console.error("Erro ao juntar ao chat:", error);
                socket.emit("error", { message: "Erro ao juntar ao chat" });
            }
        });

        // Envia mensagem para um chat específico
        socket.on("chat_message", async (data) => {
            const { chatId, content, image_url } = data;
            if (!chatId || !content) return;

            try {
                const message = await prisma.chatMessage.create({
                    data: {
                        content,
                        image_url,
                        chat_id: chatId,
                        user_id: socket.data.userId
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                });

                io.to(chatId).emit("new_message", message);
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                socket.emit("error", { message: "Erro ao enviar mensagem" });
            }
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