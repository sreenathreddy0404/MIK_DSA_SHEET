import { Router } from "express";
import {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

router.get("/", listQuestions);
router.get("/:id", getQuestion);
router.post("/", requireAuth, requireAdmin, createQuestion);
router.patch("/:id", requireAuth, requireAdmin, updateQuestion);
router.delete("/:id", requireAuth, requireAdmin, deleteQuestion);

export default router;
