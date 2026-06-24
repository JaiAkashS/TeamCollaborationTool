import { Router } from "express";

import { createChannel, joinChannel, leaveChannel, listChannelsByWorkspace } from "../controllers/index.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/workspace/:workspaceId", listChannelsByWorkspace);
router.post("/workspace/:workspaceId", createChannel);
router.post("/:channelId/join", joinChannel);
router.post("/:channelId/leave", leaveChannel);

export default router;
