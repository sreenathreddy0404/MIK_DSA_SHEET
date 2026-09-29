import { Router } from "express";
import { getProgress, setProgress } from "../controllers/progressController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getProgress);
router.put("/", requireAuth, setProgress);

export default router;
