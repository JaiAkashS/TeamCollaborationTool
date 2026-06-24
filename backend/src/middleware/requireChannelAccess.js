import { Channel } from "../models/Channel.js";
import { Workspace } from "../models/Workspace.js";
import { isSameId } from "../services/workspaceAccess.js";

export const requireChannelAccess = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    if (!channelId) {
      res.status(400).json({
        success: false,
        message: "channelId is required"
      });
      return;
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      res.status(404).json({
        success: false,
        message: "Channel not found"
      });
      return;
    }

    const workspace = await Workspace.findById(channel.workspaceId).select("ownerId members");
    const membership = workspace?.members.find(
      (member) => isSameId(member.userId, req.user._id)
    );
    const isWorkspaceOwner = isSameId(workspace?.ownerId, req.user._id);
    const isWorkspaceAdmin = membership?.role === "admin";

    const isChannelMember = channel.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    const canAccessPrivateChannel = isChannelMember || isWorkspaceOwner || isWorkspaceAdmin;
    const canAccessPublicChannel = Boolean(membership) || isWorkspaceOwner;

    const hasAccess =
      channel.type === "private" ? canAccessPrivateChannel : canAccessPublicChannel;

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this channel"
      });
      return;
    }

    req.channel = channel;
    req.workspace = workspace;
    next();
  } catch (error) {
    next(error);
  }
};
