import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
      index: true
    },
    type: {
      type: String,
      enum: ["workspace_invite", "message", "task_assigned", "task_updated"],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    body: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ workspaceId: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
