import { Router } from "express";
import ocurrenceRouter from "./routers/Ocurrence/index";
import chatRouter from "./routes/chat.routes";
import notificationRouter from "./routes/notification.routes";
import userRouter from "./routers/User";
import policeStationRouter from "./routers/PoliceStation";
import imageRouter from "./routers/Image";

const router = Router();

// Registrar todas as rotas
router.use("/ocurrence", ocurrenceRouter);
router.use("/chat", chatRouter);
router.use("/notification", notificationRouter);
router.use("/user", userRouter);
router.use("/police-station", policeStationRouter);
router.use("/image", imageRouter);

export default router; 