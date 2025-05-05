import { WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Armazenar conexões por chat
const chatConnections = new Map<string, Set<WebSocket>>();

interface ChatMessage {
  type: 'CHAT_MESSAGE';
  chatId: string;
  content: string;
  imageUrl?: string;
  userId: string;
  messageType?: 'image' | 'text';
}

export const handleChatConnection = async (ws: WebSocket, data: ChatMessage) => {
  try {
    // Verificar se o chat existe e não está resolvido
    const chat = await prisma.chat.findUnique({
      where: { id: data.chatId },
      include: { ocurrence: true }
    });

    if (!chat) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Chat não encontrado',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (chat.ocurrence.resolved) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Este chat está fechado',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Adicionar conexão ao chat específico se ainda não estiver
    if (!chatConnections.has(data.chatId)) {
      chatConnections.set(data.chatId, new Set());
    }
    chatConnections.get(data.chatId)?.add(ws);

    // Criar mensagem no banco de dados
    const newMessage = await prisma.chatMessage.create({
      data: {
        content: data.content,
        image_url: data.messageType === 'image' ? data.content : null,
        chat_id: data.chatId,
        user_id: data.userId
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

    // Broadcast da mensagem para todos os clientes no chat
    const messageToSend = JSON.stringify({
      type: 'NEW_MESSAGE',
      message: {
        ...newMessage,
        type: data.messageType || 'text'
      },
      timestamp: new Date().toISOString()
    });

    // Enviar a mensagem de volta para o remetente
    ws.send(messageToSend);

  } catch (error) {
    console.error('Erro ao processar mensagem do chat:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Erro ao processar mensagem',
      timestamp: new Date().toISOString()
    }));
  }
};

export const closeChat = async (chatId: string) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { ocurrence: true }
    });

    if (chat) {
      // Atualizar o status da ocorrência para ENCERRADO
      await prisma.ocurrence.update({
        where: { id: chat.ocurrence_id },
        data: { status: 'ENCERRADO' }
      });

      // Notificar todos os clientes conectados que o chat foi fechado
      const closeMessage = JSON.stringify({
        type: 'CHAT_CLOSED',
        message: 'Este chat foi fechado',
        timestamp: new Date().toISOString()
      });

      // A mensagem será enviada pelo WebSocket service
      return closeMessage;
    }
  } catch (error) {
    console.error('Erro ao fechar chat:', error);
    throw error;
  }
}; 