import { Router } from "express";
import {
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topicController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

router.get("/", listTopics);
router.post("/", requireAuth, requireAdmin, createTopic);
router.patch("/:id", requireAuth, requireAdmin, updateTopic);
router.delete("/:id", requireAuth, requireAdmin, deleteTopic);

export default router;
