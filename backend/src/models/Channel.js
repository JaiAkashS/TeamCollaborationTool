import mongoose from "mongoose";

const { Schema } = mongoose;

const channelSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 80
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ""
    },
    type: {
      type: String,
      enum: ["public", "private"],
      default: "public"
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User"
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

channelSchema.index({ workspaceId: 1, name: 1 }, { unique: true });
channelSchema.index({ workspaceId: 1, type: 1 });
channelSchema.index({ members: 1 });

export const Channel = mongoose.model("Channel", channelSchema);
