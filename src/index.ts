// src/index.ts
import { config } from "dotenv";
import app from "./app/app";
import { createServer } from "http";
import { initializeSocket } from "./services/socket";

// Carregar variáveis de ambiente
config();

// Criar o servidor HTTP
const server = createServer(app);

// Inicializar o Socket.IO
initializeSocket(server);

// Iniciar o servidor HTTP
const portApplication: string = process.env.PORT || "3000";

server.listen(portApplication, () => {
    console.log(`🚀 Servidor rodando na porta ${portApplication}`);
});
