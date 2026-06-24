import { Notification } from "../models/Notification.js";
import { getIO } from "../sockets/index.js";

export const createNotification = async (payload) => {
  const notification = await Notification.create(payload);

  const io = getIO();
  if (io) {
    io.to(`user:${payload.userId}`).emit("notification_received", notification);
  }

  return notification;
};

export const listNotifications = async ({ userId, limit = 20, page = 1 }) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Notification.countDocuments({ userId })
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

export const markNotificationAsRead = async ({ notificationId, userId }) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { readAt: new Date() } },
    { new: true }
  );

  return notification;
};
