import { assertWorkspaceAccess } from "../services/workspaceAccess.js";

export const requireWorkspaceAccess = (allowedRoles = ["admin", "member"]) => {
  return async (req, res, next) => {
    try {
      const { workspaceId } = req.params;

      if (!workspaceId) {
        res.status(400).json({
          success: false,
          message: "workspaceId is required"
        });
        return;
      }

      const { workspace, membership, isOwner } = await assertWorkspaceAccess({
        workspaceId,
        userId: req.user._id,
        allowedRoles
      });

      if (!isOwner && !membership) {
        res.status(403).json({
          success: false,
          message: "You do not have access to this workspace"
        });
        return;
      }

      req.workspace = workspace;
      req.workspaceMembership = membership || { role: isOwner ? "admin" : "member" };
      next();
    } catch (error) {
      next(error);
    }
  };
};
