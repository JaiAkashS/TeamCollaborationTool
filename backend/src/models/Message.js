import mongoose from "mongoose";

const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    filename: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      trim: true,
      default: "application/octet-stream"
    },
    size: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
      index: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: ""
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    editedAt: {
      type: Date,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ workspaceId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

messageSchema.pre("validate", function requireTextOrAttachment(next) {
  if (!this.text && this.attachments.length === 0) {
    next(new Error("Message requires text or at least one attachment."));
    return;
  }

  next();
});

export const Message = mongoose.model("Message", messageSchema);
