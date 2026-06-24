import { Workspace } from "../models/Workspace.js";

const getMemberUserId = (member) => {
  if (member && typeof member === "object" && "userId" in member) {
    return member.userId;
  }

  return member;
};

export const getComparableId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && "_id" in value) {
    return value._id;
  }

  return value;
};

export const isSameId = (left, right) => {
  const leftId = getComparableId(left);
  const rightId = getComparableId(right);

  return Boolean(leftId && rightId && leftId.toString() === rightId.toString());
};

export const getWorkspaceAccess = async ({ workspaceId, userId }) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = workspace.members.find((member) => {
    const memberUserId = getMemberUserId(member);
    return isSameId(memberUserId, userId);
  });

  const isOwner = isSameId(workspace.ownerId, userId);

  return {
    workspace,
    membership,
    isOwner,
    isMember: Boolean(membership),
    isAdmin: isOwner || membership?.role === "admin"
  };
};

export const assertWorkspaceAccess = async ({ workspaceId, userId, allowedRoles = ["admin", "member"] }) => {
  const access = await getWorkspaceAccess({ workspaceId, userId });

  if (!access.isOwner && !access.isMember) {
    const error = new Error("You do not have access to this workspace");
    error.statusCode = 403;
    throw error;
  }

  if (!access.isOwner && access.membership?.role && !allowedRoles.includes(access.membership.role)) {
    const error = new Error("You do not have access to this workspace");
    error.statusCode = 403;
    throw error;
  }

  return access;
};