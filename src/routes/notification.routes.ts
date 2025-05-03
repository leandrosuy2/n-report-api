import { Router } from "express";
import NotificationController from "../controllers/Notification/index";
import { authentication } from "../middlewares/Authentication";
import Authorization from "../middlewares/Authorization";

const notificationRouter = Router();

notificationRouter.get("/", authentication, NotificationController.listNotifications);
notificationRouter.put("/:id/read", authentication, NotificationController.markNotificationAsRead);
notificationRouter.post("/ocurrence/:ocurrenceId", authentication, Authorization.authorizationAdmin, NotificationController.sendOcurrenceNotification);

export default notificationRouter; 