import mongoose from "mongoose";

const { Schema } = mongoose;

const taskCommentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const taskSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 160
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: ""
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
      index: true
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dueDate: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    comments: {
      type: [taskCommentSchema],
      default: []
    }
  },
  { timestamps: true }
);

taskSchema.index({ workspaceId: 1, status: 1 });
taskSchema.index({ workspaceId: 1, assigneeId: 1 });
taskSchema.index({ assigneeId: 1, status: 1 });

export const Task = mongoose.model("Task", taskSchema);
