import { Router } from "express";
import OcurrenceController from "../../controllers/Ocurrence";
import { authentication } from "../../middlewares/Authentication";
import Authorization from "../../middlewares/Authorization";
import { photosUpload } from "../../config/multer";

const ocurrenceRouter = Router();

// Rotas que não precisam de ID
ocurrenceRouter.post("/save", authentication, photosUpload, OcurrenceController.createOcurrence);
ocurrenceRouter.post("/quick", authentication, photosUpload, OcurrenceController.createQuickOcurrence);
ocurrenceRouter.post("/panic", authentication, Authorization.authorizationGrupoDeRisco, OcurrenceController.createPanicOcurrence);

// Rotas de listagem
ocurrenceRouter.get("/", authentication, Authorization.authorizationAdmin, OcurrenceController.findAll);
ocurrenceRouter.get("/self", authentication, OcurrenceController.findAllSelf);
ocurrenceRouter.get("/count", authentication, Authorization.authorizationAdmin, OcurrenceController.ocurrenceCount);
ocurrenceRouter.get("/count/self", authentication, OcurrenceController.ocurrenceCountSelf);
ocurrenceRouter.get("/count/murder", authentication, Authorization.authorizationAdmin, OcurrenceController.murderCount);
ocurrenceRouter.get("/count/theft", authentication, Authorization.authorizationAdmin, OcurrenceController.theftCount);

// Rotas que precisam de ID
ocurrenceRouter.get("/:id", authentication, OcurrenceController.findById);
ocurrenceRouter.put("/:id", authentication, photosUpload, OcurrenceController.update);
ocurrenceRouter.patch("/:id/status", authentication, OcurrenceController.updateStatus);
ocurrenceRouter.delete("/:id", authentication, OcurrenceController.remove);

// Rota para adicionar fotos a uma ocorrência existente
ocurrenceRouter.post("/:id/photos", authentication, photosUpload, OcurrenceController.addPhotos);

export default ocurrenceRouter;