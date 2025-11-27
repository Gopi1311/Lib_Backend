import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validate } from "../middleware/validate";
import { registerUserSchema, updateUserSchema } from "../validations/userValidate";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.post("/register", validate(registerUserSchema), UserController.addUser);
router.get("/",requireAuth,requireRole(["admin"]), UserController.getAllUserDetails);
router.get("/search",requireAuth,requireRole(["admin"]), UserController.searchUser);
router.get("/me",requireAuth,requireRole(["member"]) ,UserController.getUserById);


router.put("/:id",requireAuth,requireRole(["admin","member"]), validate(updateUserSchema), UserController.updateUser);
// router.delete("/:id", UserController.deleteUser);

export default router;
