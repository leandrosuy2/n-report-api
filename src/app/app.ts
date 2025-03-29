import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";

import userRouter from "../routers/User";
import authRouter from "../routers/Authentication";
import permissionRouters from "../routers/Permission";
import ocurrenceRouter from "../routers/Ocurrence";
import policeStationRouter from "../routers/PoliceStation";
import imageRouter from "../routers/Image";
import chatRouter from "../routes/chat.routes";

const app = express();
const basePathUrlApiV1 = "/api/v1";

// Middlewares
app.use(express.json());
app.use(
    cors({
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Rotas
app.get(`${basePathUrlApiV1}/hello-world`, (req: Request, res: Response) =>
    res.status(200).json({ message: "Hello World" })
);

app.use("/auth", authRouter);
app.use(`${basePathUrlApiV1}/users`, userRouter);
app.use(`${basePathUrlApiV1}/permissions`, permissionRouters);
app.use(`${basePathUrlApiV1}/ocurrences`, ocurrenceRouter);
app.use(`${basePathUrlApiV1}/policeStation`, policeStationRouter);
app.use(`${basePathUrlApiV1}/images`, imageRouter);
app.use(`${basePathUrlApiV1}`, chatRouter);

const uploadsPath = path.join(__dirname, "..", "..", "uploads");
console.log('Serving uploads from:', uploadsPath);

app.use("/uploads", express.static(uploadsPath));

export default app;