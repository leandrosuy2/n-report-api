import express from "express";
import cors from "cors";
import { Server } from "http";
import { initializeSocket } from "./services/socket";
import { initializeNotificationSocket } from "./services/notificationSocket";

const app = express();
const server = new Server(app);

// Inicializar WebSockets
initializeSocket(server);
initializeNotificationSocket(server);

// ... rest of the code ... 