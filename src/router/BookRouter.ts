import { Router } from "express";
import { BookController } from "../controller/BookController";
import { validate } from "../middleware/validate";
import { createBookSchema, updateBookSchema } from "../validations/bookValidate";

const router = Router();

router.get("/all", BookController.fetchAllBooks);
router.get("/search", BookController.searchBook);
router.get("/:id", BookController.fetchBookById);

router.post("/", validate(createBookSchema), BookController.addBook);
router.put("/:id", validate(updateBookSchema), BookController.updateBook);

router.delete("/:id", BookController.deleteBookById);

export default router;

