import { Router } from "express";
import { BookController } from "../controller/BookController";
import { validate } from "../middleware/validate";
import { createBookSchema, updateBookSchema } from "../validations/bookValidate";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.get("/all",requireAuth,requireRole(["admin","member"]), BookController.fetchAllBooks);
router.get("/search",requireAuth,requireRole(["admin","member"]),BookController.searchBook);
router.get("/:id",requireAuth, BookController.fetchBookById);

router.post("/",requireAuth,requireRole(["admin"]), validate(createBookSchema), BookController.addBook);
router.put("/:id",requireAuth,requireRole(["admin"]), validate(updateBookSchema), BookController.updateBook);

router.delete("/:id",requireAuth,requireRole(["admin"]), BookController.deleteBookById);

export default router;

