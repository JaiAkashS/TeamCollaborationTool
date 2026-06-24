import { Router } from "express";

import { listNotificationsMine, markNotificationRead } from "../controllers/index.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listNotificationsMine);
router.patch("/:notificationId/read", markNotificationRead);

export default router;
