import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { handleChatConnection } from './chat';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Armazenar conexões por chat
const chatConnections = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer;

export const initializeWebSocket = (server: HttpServer) => {
    console.log("🔄 Inicializando WebSocket Server...");
    
    wss = new WebSocketServer({ server });

    // Função para enviar mensagem para todos os clientes de um chat específico
    const broadcastToChat = (chatId: string, data: any) => {
        const message = JSON.stringify(data);
        chatConnections.get(chatId)?.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    };

    // Função que lida com as conexões WebSocket
    wss.on('connection', async (ws, req) => {
        console.log('🔌 Nova conexão WebSocket estabelecida');
        
        // Extrair parâmetros da URL
        const url = new URL(req.url || '', 'ws://localhost');
        const chatId = url.searchParams.get('chatId');
        const userId = url.searchParams.get('userId');
        const token = url.searchParams.get('token');

        if (!chatId || !userId || !token) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Parâmetros inválidos',
                timestamp: new Date().toISOString()
            }));
            ws.close();
            return;
        }

        try {
            // Verificar se o chat existe e não está resolvido
            const chat = await prisma.chat.findUnique({
                where: { id: chatId },
                include: { ocurrence: true }
            });

            if (!chat) {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    message: 'Chat não encontrado',
                    timestamp: new Date().toISOString()
                }));
                ws.close();
                return;
            }

            if (chat.ocurrence.resolved) {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    message: 'Este chat está fechado',
                    timestamp: new Date().toISOString()
                }));
                ws.close();
                return;
            }

            // Adicionar conexão ao chat específico
            if (!chatConnections.has(chatId)) {
                chatConnections.set(chatId, new Set());
            }
            chatConnections.get(chatId)?.add(ws);

            // Enviar mensagem de boas-vindas
            ws.send(JSON.stringify({
                type: 'WELCOME',
                message: 'Conexão estabelecida com sucesso!',
                timestamp: new Date().toISOString()
            }));

            // Lidar com mensagens recebidas do cliente
            ws.on('message', (message) => {
                console.log('📩 Mensagem recebida:', message.toString());
                
                try {
                    const data = JSON.parse(message.toString());
                    
                    // Verificar o tipo de mensagem
                    if (data.type === 'CHAT_MESSAGE') {
                        handleChatConnection(ws, data);
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar mensagem:', error);
                    ws.send(JSON.stringify({
                        type: 'ERROR',
                        message: 'Erro ao processar mensagem',
                        timestamp: new Date().toISOString()
                    }));
                }
            });

            // Lidar com desconexão do cliente
            ws.on('close', () => {
                console.log('❌ Cliente desconectado');
                chatConnections.get(chatId)?.delete(ws);
                if (chatConnections.get(chatId)?.size === 0) {
                    chatConnections.delete(chatId);
                }
            });

            // Lidar com erros
            ws.on('error', () => {
                console.error('❌ Erro na conexão WebSocket');
                chatConnections.get(chatId)?.delete(ws);
                if (chatConnections.get(chatId)?.size === 0) {
                    chatConnections.delete(chatId);
                }
            });

        } catch (error) {
            console.error('❌ Erro ao verificar chat:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Erro ao verificar chat',
                timestamp: new Date().toISOString()
            }));
            ws.close();
        }
    });

    console.log('✅ WebSocket Server inicializado com sucesso!');
    return wss;
};

export const emitOcurrence = (data: any) => {
    if (!wss || chatConnections.size === 0) {
        console.log('❌ Nenhum cliente WebSocket conectado');
        return;
    }

    try {
        console.log('📡 Emitindo nova ocorrência para', chatConnections.size, 'chats');
        
        const message = JSON.stringify({
            type: 'NEW_OCURRENCE',
            data,
            timestamp: new Date().toISOString()
        });

        chatConnections.forEach((clients, chatId) => {
            clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        console.log('✅ Ocorrência emitida com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao emitir ocorrência:', error);
    }
}; 