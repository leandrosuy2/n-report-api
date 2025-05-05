import { Router } from "express";
import OcurrenceController from "../../controllers/Ocurrence";
import { authentication } from "../../middlewares/Authentication";
import Authorization from "../../middlewares/Authorization";
import multerConfig from "../../config/multer";
import multer from "multer";

const ocurrenceRouter = Router();
const upload = multer(multerConfig);

// Rotas que não precisam de ID
ocurrenceRouter.post("/save", authentication, upload.array('photos', 5), OcurrenceController.createOcurrence);
ocurrenceRouter.post("/quick", authentication, upload.array('photos', 5), OcurrenceController.createQuickOcurrence);
ocurrenceRouter.get("/", authentication, Authorization.authorizationAdmin, OcurrenceController.findAll);
ocurrenceRouter.get("/self", authentication, OcurrenceController.findAllSelf);
ocurrenceRouter.get("/count/all", authentication, OcurrenceController.ocurrenceCount);
ocurrenceRouter.get("/count/self", authentication, OcurrenceController.ocurrenceCountSelf);
ocurrenceRouter.get("/count/domestic-violence", authentication, OcurrenceController.murderCount);
ocurrenceRouter.get("/count/thefts", authentication, OcurrenceController.theftCount);

// Rotas que precisam de ID
ocurrenceRouter.get("/:id", authentication, OcurrenceController.findById);
ocurrenceRouter.put("/:id", authentication, upload.array('photos', 5), OcurrenceController.update);
ocurrenceRouter.patch("/:id/status", authentication, OcurrenceController.updateStatus);
ocurrenceRouter.delete("/:id", authentication, OcurrenceController.remove);

// Nova rota para adicionar fotos a uma ocorrência existente
ocurrenceRouter.post("/:id/photos", authentication, upload.array('photos', 5), OcurrenceController.addPhotos);

ocurrenceRouter.post("/panic", authentication, Authorization.authorizationGrupoDeRisco, OcurrenceController.createPanicOcurrence);

export default ocurrenceRouter;