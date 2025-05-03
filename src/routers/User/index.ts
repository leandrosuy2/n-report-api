import { Router } from "express";
import UserController from "../../controllers/User";
import { authentication } from "../../middlewares/Authentication";
import Authorization from "../../middlewares/Authorization";
import { multipleUploads } from "../../config/multer";

const userRouter = Router();

userRouter.get("/profile", authentication, UserController.profile);
userRouter.put("/updatePass", authentication, UserController.updatePassword);
userRouter.put("/updateEmail", authentication, UserController.updateEmail);
userRouter.put("/self", authentication, multipleUploads, UserController.updateSelf);
userRouter.delete("/self", authentication, UserController.removeSelf);
userRouter.post("/save", multipleUploads, UserController.createUser);
userRouter.get("/", authentication, Authorization.authorizationAdmin, UserController.findAll);
userRouter.get("/:id", authentication, Authorization.authorizationAdmin, UserController.findById);
userRouter.put("/:id", authentication, Authorization.authorizationAdmin, multipleUploads, UserController.update);
userRouter.delete("/:id", authentication, Authorization.authorizationAdmin, UserController.remove);

export default userRouter;