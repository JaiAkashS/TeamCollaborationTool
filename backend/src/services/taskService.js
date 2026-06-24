import { Task } from "../models/Task.js";
import { Channel } from "../models/Channel.js";
import { assertWorkspaceAccess } from "./workspaceAccess.js";
import { logActivity } from "./activityService.js";
import { createNotification } from "./notificationService.js";

export const createTask = async ({
  workspaceId,
  channelId = null,
  title,
  description = "",
  assigneeId = null,
  createdBy,
  dueDate = null
}) => {
  await assertWorkspaceAccess({ workspaceId, userId: createdBy });

  if (channelId) {
    const channel = await Channel.findOne({ _id: channelId, workspaceId });

    if (!channel) {
      const error = new Error("Channel not found");
      error.statusCode = 404;
      throw error;
    }
  }

  const task = await Task.create({
    workspaceId,
    channelId,
    title,
    description,
    assigneeId,
    createdBy,
    dueDate
  });

  const populated = await task.populate([
    { path: "assigneeId", select: "name email avatarUrl" },
    { path: "createdBy", select: "name email avatarUrl" }
  ]);

  await logActivity({
    workspaceId,
    userId: createdBy,
    entityType: "task",
    entityId: task._id,
    action: "created",
    description: `created task "${title}"`
  });

  if (assigneeId) {
    await createNotification({
      userId: assigneeId,
      workspaceId,
      type: "task_assigned",
      title: `Task assigned: ${title}`,
      body: `You have been assigned the task: "${title}".`,
      metadata: { taskId: task._id }
    });
  }

  return populated;
};

export const listWorkspaceTasks = async ({ workspaceId, status }) => {
  const query = { workspaceId };

  if (status) {
    query.status = status;
  }

  return Task.find(query)
    .populate("assigneeId", "name email avatarUrl")
    .populate("createdBy", "name email avatarUrl")
    .populate("comments.userId", "name email avatarUrl")
    .sort({ createdAt: -1 });
};

export const updateTask = async ({ taskId, workspaceId, payload, userId }) => {
  const oldTask = await Task.findOne({ _id: taskId, workspaceId });

  if (!oldTask) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const task = await Task.findOneAndUpdate(
    { _id: taskId, workspaceId },
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (payload.status === "done") {
    task.completedAt = new Date();
    await task.save();
  } else if (payload.status && payload.status !== "done") {
    task.completedAt = null;
    await task.save();
  }

  const populated = await task.populate([
    { path: "assigneeId", select: "name email avatarUrl" },
    { path: "createdBy", select: "name email avatarUrl" },
    { path: "comments.userId", select: "name email avatarUrl" }
  ]);

  if (payload.status && payload.status !== oldTask.status) {
    await logActivity({
      workspaceId,
      userId,
      entityType: "task",
      entityId: task._id,
      action: "status_changed",
      description: `changed status of task "${task.title}" to ${payload.status}`,
      details: { oldStatus: oldTask.status, newStatus: payload.status }
    });

    if (task.createdBy.toString() !== userId.toString()) {
      await createNotification({
        userId: task.createdBy,
        workspaceId,
        type: "task_updated",
        title: `Task status updated: ${task.title}`,
        body: `Task status was changed to ${payload.status}.`,
        metadata: { taskId: task._id }
      });
    }
  }

  if (payload.hasOwnProperty("assigneeId") && String(payload.assigneeId || "") !== String(oldTask.assigneeId || "")) {
    const actionDesc = payload.assigneeId
      ? `assigned task "${task.title}" to ${populated.assigneeId?.name || "someone"}`
      : `removed assignee from task "${task.title}"`;

    await logActivity({
      workspaceId,
      userId,
      entityType: "task",
      entityId: task._id,
      action: "assignee_changed",
      description: actionDesc,
      details: { oldAssignee: oldTask.assigneeId, newAssignee: payload.assigneeId }
    });

    if (payload.assigneeId) {
      await createNotification({
        userId: payload.assigneeId,
        workspaceId,
        type: "task_assigned",
        title: `Task assigned: ${task.title}`,
        body: `You have been assigned the task: "${task.title}".`,
        metadata: { taskId: task._id }
      });
    }
  }

  return populated;
};

export const addTaskComment = async ({ taskId, workspaceId, userId, text }) => {
  await assertWorkspaceAccess({ workspaceId, userId });

  const task = await Task.findOneAndUpdate(
    { _id: taskId, workspaceId },
    { $push: { comments: { userId, text } } },
    { new: true, runValidators: true }
  );

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const populated = await task.populate([
    { path: "assigneeId", select: "name email avatarUrl" },
    { path: "createdBy", select: "name email avatarUrl" },
    { path: "comments.userId", select: "name email avatarUrl" }
  ]);

  await logActivity({
    workspaceId,
    userId,
    entityType: "task",
    entityId: task._id,
    action: "commented",
    description: `commented on task "${task.title}"`,
    details: { text }
  });

  const notifyUsers = new Set();
  if (task.createdBy.toString() !== userId.toString()) {
    notifyUsers.add(task.createdBy.toString());
  }
  if (task.assigneeId && task.assigneeId.toString() !== userId.toString()) {
    notifyUsers.add(task.assigneeId.toString());
  }

  for (const nUserId of notifyUsers) {
    await createNotification({
      userId: nUserId,
      workspaceId,
      type: "task_updated",
      title: `New comment on task: ${task.title}`,
      body: `"${text.substring(0, 60)}${text.length > 60 ? "..." : ""}"`,
      metadata: { taskId: task._id }
    });
  }

  return populated;
};

export const deleteTask = async ({ taskId, workspaceId }) => {
  const task = await Task.findOneAndDelete({ _id: taskId, workspaceId });

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return task;
};
