import { Router } from "express";
import { listUsers } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

router.get("/users", requireAuth, requireAdmin, listUsers);

export default router;
