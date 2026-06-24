import { asyncHandler } from "../middleware/index.js";
import { listNotifications, markNotificationAsRead } from "../services/index.js";

export const listMine = asyncHandler(async (req, res) => {
  const result = await listNotifications({
    userId: req.user._id,
    limit: req.query.limit,
    page: req.query.page
  });

  res.status(200).json({ success: true, ...result });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationAsRead({
    notificationId: req.params.notificationId,
    userId: req.user._id
  });

  res.status(200).json({ success: true, notification });
});
