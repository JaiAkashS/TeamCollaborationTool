import { ActivityLog } from "../models/ActivityLog.js";
import { getIO } from "../sockets/index.js";

export const logActivity = async ({
  workspaceId,
  userId,
  entityType,
  entityId,
  action,
  description,
  details = {}
}) => {
  try {
    const log = await ActivityLog.create({
      workspaceId,
      userId,
      entityType,
      entityId,
      action,
      description,
      details
    });

    const populatedLog = await log.populate("userId", "name email avatarUrl");

    // Emit real-time activity log update to workspace room
    const io = getIO();
    if (io) {
      io.to(`workspace:${workspaceId}`).emit("activity_logged", populatedLog);
    }

    return populatedLog;
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Do not crash if logging fails
    return null;
  }
};

export const getWorkspaceActivity = async ({ workspaceId }) => {
  return ActivityLog.find({ workspaceId })
    .populate("userId", "name email avatarUrl")
    .sort({ createdAt: -1 })
    .limit(100);
};
