// Interface para a notificação
interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

// Array para armazenar as notificações
const notifications: Notification[] = [];

// Função para criar uma nova notificação
export const createNotification = (userId: string, title: string, message: string) => {
    const notification: Notification = {
        id: Math.random().toString(36).substr(2, 9), // ID simples
        userId,
        title,
        message,
        read: false,
        createdAt: new Date()
    };
    notifications.push(notification);
};

// Função para obter notificações de um usuário
export const getUserNotifications = (userId: string) => {
    return notifications.filter(n => n.userId === userId);
};

// Função para marcar como lida
export const markAsRead = (userId: string, notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId && n.userId === userId);
    if (notification) {
        notification.read = true;
        return true;
    }
    return false;
};

export default {
    notifications,
    createNotification,
    getUserNotifications,
    markAsRead
}; 