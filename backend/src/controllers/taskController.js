import { asyncHandler } from "../middleware/index.js";
import { createTask, deleteTask, listWorkspaceTasks, updateTask, addTaskComment } from "../services/index.js";

export const create = asyncHandler(async (req, res) => {
  const task = await createTask({
    ...req.body,
    workspaceId: req.params.workspaceId,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, task });
});

export const listByWorkspace = asyncHandler(async (req, res) => {
  const tasks = await listWorkspaceTasks({
    workspaceId: req.params.workspaceId,
    status: req.query.status
  });

  res.status(200).json({ success: true, tasks });
});

export const update = asyncHandler(async (req, res) => {
  const task = await updateTask({
    taskId: req.params.taskId,
    workspaceId: req.params.workspaceId,
    payload: req.body,
    userId: req.user._id
  });

  res.status(200).json({ success: true, task });
});

export const remove = asyncHandler(async (req, res) => {
  const task = await deleteTask({
    taskId: req.params.taskId,
    workspaceId: req.params.workspaceId
  });

  res.status(200).json({ success: true, task });
});

export const addComment = asyncHandler(async (req, res) => {
  const task = await addTaskComment({
    taskId: req.params.taskId,
    workspaceId: req.params.workspaceId,
    userId: req.user._id,
    text: req.body.text
  });

  res.status(201).json({ success: true, task });
});
