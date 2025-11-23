import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validate } from "../middleware/validate";
import { registerUserSchema, updateUserSchema } from "../validations/userValidate";

const router = Router();

router.post("/", validate(registerUserSchema), UserController.addUser);
router.get("/", UserController.getAllUserDetails);
router.get("/search", UserController.searchUser);
router.get("/:id", UserController.getUserById);


router.put("/:id", validate(updateUserSchema), UserController.updateUser);
// router.delete("/:id", UserController.deleteUser);

export default router;
