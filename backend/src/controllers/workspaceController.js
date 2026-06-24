import { asyncHandler } from "../middleware/index.js";
import {
  createWorkspace,
  getWorkspaceActivity,
  getWorkspaceById,
  inviteMemberToWorkspace,
  joinWorkspaceByInviteCode,
  listUserWorkspaces
} from "../services/index.js";

export const create = asyncHandler(async (req, res) => {
  const workspace = await createWorkspace({
    ...req.body,
    ownerId: req.user._id
  });

  res.status(201).json({ success: true, workspace });
});

export const listMine = asyncHandler(async (req, res) => {
  const workspaces = await listUserWorkspaces({ userId: req.user._id });
  res.status(200).json({ success: true, workspaces });
});

export const getById = asyncHandler(async (req, res) => {
  const workspace = await getWorkspaceById({
    workspaceId: req.params.workspaceId,
    userId: req.user._id
  });

  res.status(200).json({ success: true, workspace });
});

export const invite = asyncHandler(async (req, res) => {
  const workspace = await inviteMemberToWorkspace({
    workspaceId: req.params.workspaceId,
    inviterId: req.user._id,
    ...req.body
  });

  res.status(200).json({ success: true, workspace });
});

export const joinByInviteCode = asyncHandler(async (req, res) => {
  const workspace = await joinWorkspaceByInviteCode({
    inviteCode: req.body.inviteCode,
    userId: req.user._id
  });

  res.status(200).json({ success: true, workspace });
});

export const listActivity = asyncHandler(async (req, res) => {
  const activities = await getWorkspaceActivity({
    workspaceId: req.params.workspaceId
  });

  res.status(200).json({ success: true, activities });
});
