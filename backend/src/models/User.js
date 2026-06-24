import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: null
    },
    refreshTokenHash: {
      type: String,
      select: false,
      default: null
    },
    lastActiveAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshTokenHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.setRefreshToken = async function setRefreshToken(refreshToken) {
  this.refreshTokenHash = refreshToken ? await bcrypt.hash(refreshToken, 12) : null;
};

userSchema.methods.compareRefreshToken = function compareRefreshToken(refreshToken) {
  if (!this.refreshTokenHash) {
    return false;
  }

  return bcrypt.compare(refreshToken, this.refreshTokenHash);
};

export const User = mongoose.model("User", userSchema);
