import { config } from "dotenv";
import app from "./app/app";
import cors from "cors";

// Carregar as variáveis de ambiente
config();

// Configurar CORS
const allowedOrigins = [
    "http://localhost:3000", // Permite acesso do frontend que está rodando nesta porta
    "http://localhost:8080", // Adicione a origem que você está tentando permitir
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
                callback(null, true); // Permite a origem
            } else {
                callback(new Error("Not allowed by CORS")); // Bloqueia a origem
            }
        },
        credentials: true,
    })
);

const portApplication: string | undefined = process.env.PORT;

// Iniciar o servidor
app.listen(portApplication, () => {
    console.log(`Application running on the port ${portApplication}`);
});
