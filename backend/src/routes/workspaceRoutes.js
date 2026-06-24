import { Router } from "express";

import {
  createWorkspace,
  getWorkspaceById,
  inviteWorkspaceMember,
  joinWorkspaceByInviteCode,
  listMyWorkspaces,
  listWorkspaceActivity
} from "../controllers/index.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listMyWorkspaces);
router.post("/", createWorkspace);
router.post("/join", joinWorkspaceByInviteCode);
router.get("/:workspaceId", getWorkspaceById);
router.post("/:workspaceId/invite", inviteWorkspaceMember);
router.get("/:workspaceId/activity", listWorkspaceActivity);

export default router;
