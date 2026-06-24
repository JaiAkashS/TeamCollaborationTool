import { randomBytes } from "node:crypto";

import { Channel, Workspace } from "../models/index.js";
import { createNotification } from "./notificationService.js";
import { User } from "../models/User.js";
import { isSameId } from "./workspaceAccess.js";
import { logActivity } from "./activityService.js";

const buildInviteCode = () => randomBytes(6).toString("hex");

export const createWorkspace = async ({ name, description = "", ownerId }) => {
  const workspace = await Workspace.create({
    name,
    description,
    ownerId,
    members: [{ userId: ownerId, role: "admin" }],
    inviteCode: buildInviteCode()
  });

  await Channel.create({
    workspaceId: workspace._id,
    name: "general",
    type: "public",
    createdBy: ownerId,
    members: [ownerId]
  });

  return workspace;
};

export const listUserWorkspaces = async ({ userId }) => {
  return Workspace.find({
    $or: [{ ownerId: userId }, { "members.userId": userId }]
  }).sort({ createdAt: -1 });
};

export const getWorkspaceById = async ({ workspaceId, userId }) => {
  const workspace = await Workspace.findById(workspaceId).populate([
    { path: "ownerId", select: "name email avatarUrl" },
    { path: "members.userId", select: "name email avatarUrl" }
  ]);

  if (!workspace) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = isSameId(workspace.ownerId, userId);
  const isMember = workspace.members.some((member) => isSameId(member.userId, userId));

  if (!isOwner && !isMember) {
    const error = new Error("You do not have access to this workspace");
    error.statusCode = 403;
    throw error;
  }

  return workspace;
};

export const inviteMemberToWorkspace = async ({
  workspaceId,
  inviterId,
  email,
  role = "member"
}) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  const inviterMembership = workspace.members.find((member) => isSameId(member.userId, inviterId));
  const isOwner = isSameId(workspace.ownerId, inviterId);

  if (!isOwner && inviterMembership?.role !== "admin") {
    const error = new Error("Only admins can invite users");
    error.statusCode = 403;
    throw error;
  }

  const invitedUser = await User.findOne({ email });

  if (!invitedUser) {
    const error = new Error("No user found for that email");
    error.statusCode = 404;
    throw error;
  }

  const alreadyMember = workspace.members.some((member) => isSameId(member.userId, invitedUser._id));

  if (alreadyMember) {
    const error = new Error("User is already a workspace member");
    error.statusCode = 409;
    throw error;
  }

  workspace.members.push({ userId: invitedUser._id, role });
  await workspace.save();
  await workspace.populate([
    { path: "ownerId", select: "name email avatarUrl" },
    { path: "members.userId", select: "name email avatarUrl" }
  ]);

  await logActivity({
    workspaceId: workspace._id,
    userId: inviterId,
    entityType: "member",
    entityId: invitedUser._id,
    action: "invited",
    description: `invited ${invitedUser.name} to the workspace`,
    details: { invitedUserEmail: email, role }
  });

  await createNotification({
    userId: invitedUser._id,
    workspaceId: workspace._id,
    type: "workspace_invite",
    title: `Invited to ${workspace.name}`,
    body: `You were added to workspace ${workspace.name} by another member.`,
    metadata: { inviterId, workspaceId: workspace._id, role }
  });

  return workspace;
};

export const joinWorkspaceByInviteCode = async ({ inviteCode, userId }) => {
  const workspace = await Workspace.findOne({ inviteCode });

  if (!workspace) {
    const error = new Error("Invalid invite code");
    error.statusCode = 404;
    throw error;
  }

  const alreadyMember = workspace.members.some((member) => isSameId(member.userId, userId));

  if (!alreadyMember) {
    workspace.members.push({ userId, role: "member" });
    await workspace.save();
  }

  await workspace.populate([
    { path: "ownerId", select: "name email avatarUrl" },
    { path: "members.userId", select: "name email avatarUrl" }
  ]);

  await logActivity({
    workspaceId: workspace._id,
    userId,
    entityType: "member",
    entityId: userId,
    action: "joined",
    description: `joined the workspace`,
    details: { inviteCode }
  });

  return workspace;
};
