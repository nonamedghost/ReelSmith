
import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["veo", "pexels", "hybrid"],
      default: "veo",
    },

    uploadToYoutube: {
      type: Boolean,
      default: true,
    },

    maxLibraryReels: {
      type: Number,
      default: 10,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const UserSettings = mongoose.model(
  "UserSettings",
  userSettingsSchema
);

export default UserSettings;