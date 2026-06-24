import { Router } from "express";

import { createTask, deleteTask, listTasksByWorkspace, updateTask, addTaskComment } from "../controllers/index.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/workspace/:workspaceId", listTasksByWorkspace);
router.post("/workspace/:workspaceId", createTask);
router.patch("/workspace/:workspaceId/:taskId", updateTask);
router.delete("/workspace/:workspaceId/:taskId", deleteTask);
router.post("/workspace/:workspaceId/:taskId/comments", addTaskComment);

export default router;
