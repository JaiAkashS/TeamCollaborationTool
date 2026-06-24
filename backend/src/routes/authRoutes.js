import { Router } from "express";

import {
  login,
  logout,
  me,
  refresh,
  signup
} from "../controllers/index.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);

export default router;
