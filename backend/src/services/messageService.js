import { Message } from "../models/Message.js";
import { assertChannelAccess } from "./channelService.js";

export const sendMessage = async ({ channelId, workspaceId, senderId, text, attachments = [], parentId = null }) => {
  const { channel, workspace } = await assertChannelAccess({ channelId, userId: senderId });

  const message = await Message.create({
    channelId,
    workspaceId: workspace._id,
    senderId,
    text,
    attachments,
    parentId
  });

  return message;
};

export const listMessages = async ({ channelId, page = 1, limit = 30 }) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Message.find({ channelId })
      .populate("senderId", "name email avatarUrl")
      .populate({
        path: "parentId",
        populate: { path: "senderId", select: "name email avatarUrl" }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Message.countDocuments({ channelId })
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit) || 0
    }
  };
};

export const editMessage = async ({ messageId, senderId, text }) => {
  const message = await Message.findOne({ _id: messageId, senderId });

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  message.text = text;
  message.editedAt = new Date();
  await message.save();

  return message;
};

export const deleteMessage = async ({ messageId, senderId }) => {
  const message = await Message.findOneAndUpdate(
    { _id: messageId, senderId },
    { $set: { deletedAt: new Date(), text: "", attachments: [] } },
    { new: true }
  );

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  return message;
};
