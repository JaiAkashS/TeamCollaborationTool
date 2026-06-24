import mongoose from "mongoose";

const { Schema } = mongoose;

const workspaceMemberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    members: {
      type: [workspaceMemberSchema],
      default: []
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    }
  },
  { timestamps: true }
);

workspaceSchema.index({ "members.userId": 1 });
workspaceSchema.index({ ownerId: 1, createdAt: -1 });

export const Workspace = mongoose.model("Workspace", workspaceSchema);
