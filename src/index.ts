import { config } from "dotenv";
import app from "./app/app";
import cors from "cors";

// Carregar as variáveis de ambiente
config();

// Configurar CORS para permitir todas as origens
app.use(
    cors({
        origin: "*", // Permite todas as origens
        credentials: true,
    })
);

const portApplication: string | undefined = process.env.PORT;

// Iniciar o servidor
app.listen(portApplication, () => {
    console.log(`Application running on the port ${portApplication}`);
});
