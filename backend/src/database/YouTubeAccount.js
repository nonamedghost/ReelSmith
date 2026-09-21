
import mongoose from "mongoose";

const youtubeAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    channelId: {
      type: String,
      required: true,
    },

    channelName: {
      type: String,
      required: true,
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    tokens: {
      access_token: {
        type: String,
        required: true,
      },

      refresh_token: {
        type: String,
        required: true,
      },

      scope: {
        type: String,
        default: null,
      },

      token_type: {
        type: String,
        default: "Bearer",
      },

      expiry_date: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const YouTubeAccount = mongoose.model(
  "YouTubeAccount",
  youtubeAccountSchema
);

export default YouTubeAccount;