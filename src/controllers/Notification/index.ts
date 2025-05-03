import { Request, Response } from "express";
import { getUserNotifications, markAsRead, createNotification } from "../../utils/notifications";
import User from "../../models/User";
import Ocurrence from "../../models/Ocurrence";
import { emitNotification } from "../../services/notificationSocket";

const listNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = getUserNotifications(req.userId);

        return res.status(200).json({
            status: "success",
            message: "Notificações listadas com sucesso",
            data: notifications
        });

    } catch (error) {
        console.error("Erro ao listar notificações:", error);
        return res.status(500).json({
            status: "error",
            message: "Erro interno do servidor"
        });
    }
};

const markNotificationAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const success = markAsRead(req.userId, id);

        if (!success) {
            return res.status(404).json({
                status: "error",
                message: "Notificação não encontrada"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Notificação marcada como lida"
        });

    } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        return res.status(500).json({
            status: "error",
            message: "Erro interno do servidor"
        });
    }
};

const sendOcurrenceNotification = async (req: Request, res: Response) => {
    try {
        const { ocurrenceId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                status: "error",
                message: "Mensagem é obrigatória"
            });
        }

        // Buscar a ocorrência
        const ocurrence = await Ocurrence.findUnique({
            where: { id: ocurrenceId },
            include: {
                User: {
                    select: {
                        name: true
                    }
                },
                PoliceStation: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!ocurrence) {
            return res.status(404).json({
                status: "error",
                message: "Ocorrência não encontrada"
            });
        }

        // Buscar todos os usuários
        const users = await User.findMany({
            select: {
                id: true
            }
        });

        // Enviar notificação para cada usuário via WebSocket
        users.forEach(user => {
            const notificationData = {
                userId: user.id,
                title: "Nova Atualização de Ocorrência",
                message: `${message}\n\nDetalhes da Ocorrência:\n` +
                    `Título: ${ocurrence.title || "Sem título"}\n` +
                    `Tipo: ${ocurrence.type || "Não especificado"}\n` +
                    `Descrição: ${ocurrence.description || "Sem descrição"}\n` +
                    `Data: ${ocurrence.date || "Não especificada"}\n` +
                    `Hora: ${ocurrence.time || "Não especificada"}\n` +
                    `Localização: ${ocurrence.latitude}, ${ocurrence.longitude}\n` +
                    `Registrado por: ${ocurrence.User.name}\n` +
                    (ocurrence.PoliceStation ? `Delegacia responsável: ${ocurrence.PoliceStation.name}` : "")
            };

            emitNotification(notificationData);
        });

        return res.status(200).json({
            status: "success",
            message: "Notificações enviadas com sucesso",
            data: {
                totalUsers: users.length,
                ocurrence: {
                    id: ocurrence.id,
                    title: ocurrence.title,
                    type: ocurrence.type,
                    description: ocurrence.description,
                    date: ocurrence.date,
                    time: ocurrence.time,
                    latitude: ocurrence.latitude,
                    longitude: ocurrence.longitude,
                    user: ocurrence.User.name,
                    policeStation: ocurrence.PoliceStation?.name
                }
            }
        });

    } catch (error) {
        console.error("Erro ao enviar notificações:", error);
        return res.status(500).json({
            status: "error",
            message: "Erro interno do servidor"
        });
    }
};

export default {
    listNotifications,
    markNotificationAsRead,
    sendOcurrenceNotification
}; 