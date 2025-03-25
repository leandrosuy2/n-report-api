import { Router } from 'express';
import { createChat, getChatMessages, closeChatEndpoint, getChatStatus } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Criar um novo chat para uma ocorrência
router.post('/ocurrences/:ocurrenceId/chat', createChat);

// Obter mensagens de um chat específico
router.get('/chats/:chatId/messages', getChatMessages);

// Fechar um chat
router.post('/chats/:chatId/close', closeChatEndpoint);

// Verificar status do chat
router.get('/chats/:chatId/status', getChatStatus);

export default router; 