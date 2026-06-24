import { asyncHandler } from "../middleware/index.js";
import { deleteMessage, editMessage, listMessages, sendMessage } from "../services/index.js";

export const create = asyncHandler(async (req, res) => {
  const message = await sendMessage({
    channelId: req.params.channelId,
    workspaceId: req.body.workspaceId,
    senderId: req.user._id,
    text: req.body.text,
    attachments: req.body.attachments || [],
    parentId: req.body.parentId || null
  });

  const populated = await message.populate([
    { path: "senderId", select: "name email avatarUrl" },
    { path: "parentId", populate: { path: "senderId", select: "name email avatarUrl" } }
  ]);

  res.status(201).json({ success: true, message: populated });
});

export const listByChannel = asyncHandler(async (req, res) => {
  const result = await listMessages({
    channelId: req.params.channelId,
    page: req.query.page,
    limit: req.query.limit
  });

  res.status(200).json({ success: true, ...result });
});

export const update = asyncHandler(async (req, res) => {
  const message = await editMessage({
    messageId: req.params.messageId,
    senderId: req.user._id,
    text: req.body.text
  });

  const populated = await message.populate([
    { path: "senderId", select: "name email avatarUrl" },
    { path: "parentId", populate: { path: "senderId", select: "name email avatarUrl" } }
  ]);

  const io = req.app.get("io");
  if (io) {
    io.to(`channel:${message.channelId}`).emit("message_updated", populated);
  }

  res.status(200).json({ success: true, message: populated });
});

export const remove = asyncHandler(async (req, res) => {
  const message = await deleteMessage({
    messageId: req.params.messageId,
    senderId: req.user._id
  });

  const io = req.app.get("io");
  if (io) {
    io.to(`channel:${message.channelId}`).emit("message_deleted", {
      messageId: message._id,
      channelId: message.channelId
    });
  }

  res.status(200).json({ success: true, message });
});
