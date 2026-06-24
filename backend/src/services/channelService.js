import { Channel } from "../models/Channel.js";
import { assertWorkspaceAccess } from "./workspaceAccess.js";

export const assertChannelAccess = async ({ channelId, userId }) => {
  const channel = await Channel.findById(channelId);

  if (!channel) {
    const error = new Error("Channel not found");
    error.statusCode = 404;
    throw error;
  }

  const { workspace, membership, isOwner: isWorkspaceOwner, isAdmin: isWorkspaceAdmin } = await assertWorkspaceAccess({
    workspaceId: channel.workspaceId,
    userId
  });

  const isChannelMember = channel.members.some((member) => member.toString() === userId.toString());

  const hasAccess =
    channel.type === "private"
      ? isChannelMember || isWorkspaceOwner || isWorkspaceAdmin
      : Boolean(membership) || isWorkspaceOwner;

  if (!hasAccess) {
    const error = new Error("You do not have access to this channel");
    error.statusCode = 403;
    throw error;
  }

  return { channel, workspace, membership };
};

export const createChannel = async ({
  workspaceId,
  name,
  description = "",
  type = "public",
  createdBy
}) => {
  await assertWorkspaceAccess({ workspaceId, userId: createdBy });

  const normalizedName = name?.trim().toLowerCase();

  if (!normalizedName) {
    const error = new Error("Channel name is required");
    error.statusCode = 400;
    throw error;
  }

  const existingChannel = await Channel.findOne({ workspaceId, name: normalizedName });

  if (existingChannel) {
    const error = new Error("Channel already exists in this workspace");
    error.statusCode = 409;
    throw error;
  }

  const channel = await Channel.create({
    workspaceId,
    name: normalizedName,
    description,
    type,
    createdBy,
    members: type === "public" ? [createdBy] : []
  });

  await channel.populate("members", "name email avatarUrl");
  return channel;
};

export const listWorkspaceChannels = async ({ workspaceId, userId }) => {
  await assertWorkspaceAccess({ workspaceId, userId });

  return Channel.find({ workspaceId })
    .populate("members", "name email avatarUrl")
    .sort({ createdAt: 1 });
};

export const joinChannel = async ({ channelId, userId }) => {
  const { channel } = await assertChannelAccess({ channelId, userId });

  if (!channel.members.some((member) => member.toString() === userId.toString())) {
    channel.members.push(userId);
    await channel.save();
  }

  await channel.populate("members", "name email avatarUrl");
  return channel;
};

export const leaveChannel = async ({ channelId, userId }) => {
  const channel = await Channel.findById(channelId);

  if (!channel) {
    const error = new Error("Channel not found");
    error.statusCode = 404;
    throw error;
  }

  const memberIndex = channel.members.findIndex((member) => member.toString() === userId.toString());
  if (memberIndex === -1) {
    const error = new Error("You are not a member of this channel");
    error.statusCode = 400;
    throw error;
  }

  channel.members.splice(memberIndex, 1);
  await channel.save();

  await channel.populate("members", "name email avatarUrl");
  return channel;
};
