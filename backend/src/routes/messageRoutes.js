import { Router } from "express";

import { createMessage, deleteMessage, listMessagesByChannel, updateMessage } from "../controllers/index.js";
import { authMiddleware, requireChannelAccess } from "../middleware/index.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/channel/:channelId", requireChannelAccess, listMessagesByChannel);
router.post("/channel/:channelId", requireChannelAccess, createMessage);
router.patch("/:messageId", requireChannelAccess, updateMessage);
router.delete("/:messageId", requireChannelAccess, deleteMessage);

export default router;
