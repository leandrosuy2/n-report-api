import { Router } from "express";
import NotificationController from "../controllers/Notification";
import { authentication } from "../middlewares/authentication";

const notificationRouter = Router();

notificationRouter.get("/", authentication, NotificationController.listNotifications);
notificationRouter.put("/:id/read", authentication, NotificationController.markNotificationAsRead);

export default notificationRouter; 