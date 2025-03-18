import { Router } from "express";
import { authentication } from "../../middlewares/Authentication";
import ImageController from "../../controllers/Image";
import multer from "multer";
import { storage } from "../../config/multer";

const upload = multer({ storage: storage });
const imageRouter = Router();

// Rotas protegidas por autenticação
imageRouter.use(authentication);

// Upload de imagem
imageRouter.post('/upload', upload.single('image'), ImageController.upload);

// Obter imagens do usuário logado
imageRouter.get('/my-images', ImageController.getUserImages);

// Obter uma imagem específica
imageRouter.get('/:id', ImageController.getImage);

// Atualizar imagem
imageRouter.put('/:id', upload.single('image'), ImageController.update);

// Deletar imagem
imageRouter.delete('/:id', ImageController.remove);

export default imageRouter;