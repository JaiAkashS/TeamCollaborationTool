import { asyncHandler } from "../middleware/index.js";
import { createChannel, joinChannel, leaveChannel, listWorkspaceChannels } from "../services/index.js";


export const create = asyncHandler(async (req, res) => {
  const channel = await createChannel({
    ...req.body,
    workspaceId: req.params.workspaceId,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, channel });
});

export const listByWorkspace = asyncHandler(async (req, res) => {
  const channels = await listWorkspaceChannels({
    workspaceId: req.params.workspaceId,
    userId: req.user._id
  });

  res.status(200).json({ success: true, channels });
});

export const join = asyncHandler(async (req, res) => {
  const channel = await joinChannel({
    channelId: req.params.channelId,
    userId: req.user._id
  });

  res.status(200).json({ success: true, channel });
});

export const leave = asyncHandler(async (req, res) => {
  const channel = await leaveChannel({
    channelId: req.params.channelId,
    userId: req.user._id
  });

  res.status(200).json({ success: true, channel });
});
