import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { closeChat } from '../services/chat';

const prisma = new PrismaClient();

export const createChat = async (req: Request, res: Response) => {
    try {
        const { ocurrenceId } = req.params;
        const userId = req.user?.id; // Assuming you have user info in req.user

        // Verificar se a ocorrência existe e não está encerrada
        const ocurrence = await prisma.ocurrence.findUnique({
            where: { id: ocurrenceId }
        });

        if (!ocurrence) {
            return res.status(404).json({ message: 'Ocorrência não encontrada' });
        }

        if (ocurrence.status === 'ENCERRADO') {
            return res.status(400).json({ message: 'Não é possível criar um chat para uma ocorrência encerrada' });
        }

        // Verificar se já existe um chat para esta ocorrência
        const existingChat = await prisma.chat.findFirst({
            where: { ocurrence_id: ocurrenceId },
            include: {
                ocurrence: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        created_at: true,
                        updated_at: true
                    }
                },
                messages: {
                    take: 1,
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            }
        });

        if (existingChat) {
            return res.status(200).json({
                message: 'Chat encontrado para esta ocorrência',
                chat: existingChat
            });
        }

        // Criar novo chat
        const newChat = await prisma.chat.create({
            data: {
                ocurrence_id: ocurrenceId
            },
            include: {
                ocurrence: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        created_at: true,
                        updated_at: true
                    }
                },
                messages: true
            }
        });

        return res.status(201).json({
            message: 'Chat criado com sucesso',
            chat: newChat
        });

    } catch (error) {
        console.error('Erro ao criar chat:', error);
        return res.status(500).json({ message: 'Erro ao criar chat' });
    }
};

export const getChatMessages = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;

        const messages = await prisma.chatMessage.findMany({
            where: { chat_id: chatId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        return res.json(messages);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

export const closeChatEndpoint = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;
        const userId = req.user?.id; // Assuming you have user info in req.user

        // Verificar se o chat existe
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: { ocurrence: true }
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat não encontrado' });
        }

        // Verificar se o usuário tem permissão para fechar o chat
        // (Você pode adicionar sua própria lógica de permissão aqui)
        if (chat.ocurrence.user_id !== userId) {
            return res.status(403).json({ message: 'Você não tem permissão para fechar este chat' });
        }

        // Fechar o chat
        await prisma.ocurrence.update({
            where: { id: chat.ocurrence_id },
            data: { status: 'ENCERRADO' }
        });

        // Notificar todos os clientes conectados
        await closeChat(chatId);

        return res.json({ message: 'Chat fechado com sucesso' });
    } catch (error) {
        console.error('Erro ao fechar chat:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

export const getChatStatus = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;

        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                ocurrence: true
            }
        });

        if (!chat) {
            return res.status(404).json({ 
                message: 'Chat não encontrado',
                exists: false
            });
        }

        return res.json({
            exists: true,
            isResolved: chat.ocurrence.status === 'ENCERRADO',
            chat: chat
        });
    } catch (error) {
        console.error('Erro ao verificar status do chat:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}; 