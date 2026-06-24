import mongoose from "mongoose";

const { Schema } = mongoose;

const activityLogSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    entityType: {
      type: String,
      enum: ["workspace", "channel", "message", "task", "comment", "member"],
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

activityLogSchema.index({ workspaceId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
