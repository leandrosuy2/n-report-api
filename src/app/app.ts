import express, { Request, Response } from "express"
import cors from "cors"
import userRouter from "../routers/User"
import authRouter from "../routers/Authentication";
import permissionRouters from "../routers/Permission";
import ocurrenceRouter from "../routers/Ocurrence";
import policeStationRouter from "../routers/PoliceStation";
import path from "path";
import imageRouter from "../routers/Image";

const app = express();

app.use(express.json());
app.use(cors());  // Permitindo todas as origens temporariamente para teste

const basePathUrlApiV1 = "/api/v1";

// Rota de teste
app.get(`${basePathUrlApiV1}/hello-world`, (req: Request, res: Response) => res.status(200).send({message: 'Hello World'}));

// Rotas de autenticação
app.use(`${basePathUrlApiV1}/auth`, authRouter);

// Rotas da API
app.use(`${basePathUrlApiV1}/users`, userRouter);
app.use(`${basePathUrlApiV1}/permissions`, permissionRouters);
app.use(`${basePathUrlApiV1}/ocurrences`, ocurrenceRouter);
app.use(`${basePathUrlApiV1}/police-station`, policeStationRouter);
app.use(`${basePathUrlApiV1}/images`, imageRouter);

// Rota para servir imagens estáticas
app.use("/uploads", express.static(path.join(__dirname, "..", "..", "uploads")));

export default app;