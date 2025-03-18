import { Request, Response } from "express";
import { getUserNotifications, markAsRead } from "../../utils/notifications";

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

export default {
    listNotifications,
    markNotificationAsRead
}; 