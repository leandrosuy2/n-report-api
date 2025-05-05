import express from "express";
import cors from "cors";
import { Server } from "http";
import { initializeSocket } from "./services/socket";
import { initializeNotificationSocket } from "./services/notificationSocket";
import routes from "./routes";

const app = express();
const server = new Server(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use(routes);

// Inicializar WebSockets
initializeSocket(server);
initializeNotificationSocket(server);

export default server; 