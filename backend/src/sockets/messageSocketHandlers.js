import { sendMessage } from "../services/messageService.js";
import { assertChannelAccess } from "../services/channelService.js";

const buildAttachmentPayload = (attachments = []) => {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments.map((attachment) => ({
    url: attachment.url,
    filename: attachment.filename,
    mimeType: attachment.mimeType,
    size: attachment.size
  }));
};

export const registerMessageHandlers = (socket, io) => {
  socket.on("join_channel", ({ channelId }) => {
    if (!channelId) {
      socket.emit("socket_error", { message: "channelId is required" });
      return;
    }

    assertChannelAccess({ channelId, userId: socket.user._id })
      .then(() => {
        socket.join(`channel:${channelId}`);
        socket.emit("channel_joined", { channelId });
      })
      .catch((error) => {
        socket.emit("socket_error", { message: error.message || "Unable to join channel" });
      });
  });

  socket.on("leave_channel", ({ channelId }) => {
    if (!channelId) {
      return;
    }

    socket.leave(`channel:${channelId}`);
  });

  socket.on("typing", ({ channelId, isTyping }) => {
    if (!channelId) {
      return;
    }

    socket.to(`channel:${channelId}`).emit("typing", {
      channelId,
      userId: socket.user._id,
      name: socket.user.name,
      isTyping: Boolean(isTyping)
    });
  });

  socket.on("send_message", async (payload, ack) => {
    try {
      const { channelId, workspaceId, text, parentId } = payload || {};
      const attachments = buildAttachmentPayload(payload?.attachments);

      if (!channelId) {
        const error = new Error("channelId is required");
        error.statusCode = 400;
        throw error;
      }

      const message = await sendMessage({
        channelId,
        workspaceId,
        senderId: socket.user._id,
        text,
        attachments,
        parentId
      });

      const populatedMessage = await message.populate([
        { path: "senderId", select: "name email avatarUrl" },
        { path: "channelId", select: "name type workspaceId" },
        {
          path: "parentId",
          populate: { path: "senderId", select: "name email avatarUrl" }
        }
      ]);

      io.to(`channel:${channelId}`).emit("receive_message", populatedMessage);

      if (typeof ack === "function") {
        ack({ success: true, message: populatedMessage });
      }
    } catch (error) {
      if (typeof ack === "function") {
        ack({
          success: false,
          message: error.message || "Failed to send message"
        });
      } else {
        socket.emit("socket_error", {
          message: error.message || "Failed to send message"
        });
      }
    }
  });
};
