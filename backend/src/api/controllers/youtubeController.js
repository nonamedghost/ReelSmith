import fsExtra from "fs-extra";
import path from "path";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { getAuthUrl, saveToken, createOAuthClient, } from "../../youtube/auth.js";
import YouTubeAccount from "../../database/YouTubeAccount.js";

import { uploadYoutubeVideo } from "../../youtube/uploadYoutube.js";
import { LIBRARY_DIR } from "../../utils/paths.js";

export async function getYoutubeStatus(req, res) {
  try {
    const userId = req.user.userId;

    const account = await YouTubeAccount.findOne({ userId });

    if (!account) {
      return res.json({
        success: true,
        youtube: {
          connected: false,
          channelId: null,
          channelName: null,
          avatarUrl: null,
        },
      });
    }

    res.json({
      success: true,
      youtube: {
        connected: true,
        channelId: account.channelId,
        channelName: account.channelName,
        avatarUrl: account.avatarUrl,
      },
    });
  } catch (err) {
    console.error("Failed to get YouTube status:", err);

    res.status(500).json({
      success: false,
      message: "Failed to get YouTube status.",
    });
  }
}

export async function getYoutubeAuthUrl(req, res) {
  try {
    const userId = req.user.userId;

    const state = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const url = getAuthUrl(state);

    res.json({
      success: true,
      url,
    });
  } catch (err) {
    console.error("Failed to generate YouTube auth URL:", err);

    res.status(500).json({
      success: false,
      message: "Failed to generate YouTube OAuth URL.",
    });
  }
}

export async function youtubeCallback(req, res) {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send("Missing authorization code or state.");
    }

    const decoded = jwt.verify(
      state,
      process.env.JWT_SECRET
    );

    const userId = decoded.userId;

    const tokens = await saveToken(code);

    const existingAccount = await YouTubeAccount.findOne({
      userId,
    });

    const refreshToken =
      tokens.refresh_token ||
      existingAccount?.tokens?.refresh_token;

    if (!refreshToken) {
      return res.status(400).send(
        "No refresh token received. Please reconnect your YouTube account."
      );
    }

    const mergedTokens = {
      ...(existingAccount?.tokens?.toObject?.() || {}),
      ...tokens,
      refresh_token: refreshToken,
    };

    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials(mergedTokens);

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const response = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    const channel = response.data.items?.[0];

    if (!channel) {
      return res.status(400).send("No YouTube channel found.");
    }

    await YouTubeAccount.findOneAndUpdate(
      { userId },
      {
        userId,
        channelId: channel.id,
        channelName: channel.snippet.title,
        avatarUrl:
          channel.snippet.thumbnails?.default?.url || null,
        tokens: mergedTokens,
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      }
    );

    res.redirect(`${process.env.FRONTEND_URL}/settings`);
  } catch (err) {
    console.error("YouTube OAuth callback failed:", err);

    res.status(500).send("YouTube authentication failed.");
  }
}

export async function disconnectYoutube(req, res) {
  try {
    const userId = req.user.userId;

    await YouTubeAccount.findOneAndDelete({ userId });

    res.json({
      success: true,
      message: "YouTube disconnected.",
    });
  } catch (err) {
    console.error("Failed to disconnect YouTube:", err);

    res.status(500).json({
      success: false,
      message: "Failed to disconnect YouTube.",
    });
  }
}

export async function uploadReelToYoutube(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Reel ID is required.",
      });
    }

    // Get the logged-in user's YouTube account
    const userId = req.user.userId;

    const account = await YouTubeAccount.findOne({ userId });

    if (!account) {
      return res.status(401).json({
        success: false,
        error: "YouTube is not connected.",
      });
    }

    if (!account.tokens?.access_token && !account.tokens?.refresh_token) {
      return res.status(401).json({
        success: false,
        error: "YouTube authentication tokens are missing.",
      });
    }

    const reelDir = path.join(LIBRARY_DIR, id);
    const reelJsonPath = path.join(reelDir, "reel.json");
    const metadataPath = path.join(reelDir, "metadata.json");

    // Check reel exists
    if (!(await fsExtra.pathExists(reelJsonPath))) {
      return res.status(404).json({
        success: false,
        error: "Reel not found.",
      });
    }

    // Load reel information
    const reel = await fsExtra.readJson(reelJsonPath);

    if (!reel.files?.video) {
      return res.status(404).json({
        success: false,
        error: "Video information missing from reel.",
      });
    }

    const videoPath = path.join(reelDir, reel.files.video);

    if (!(await fsExtra.pathExists(videoPath))) {
      return res.status(404).json({
        success: false,
        error: "Video file not found.",
      });
    }

    // Check metadata exists
    if (!(await fsExtra.pathExists(metadataPath))) {
      return res.status(404).json({
        success: false,
        error: "Metadata file not found.",
      });
    }

    const metadata = await fsExtra.readJson(metadataPath);

    console.log(`Starting manual YouTube upload for reel: ${id}`);

    // Upload using this user's MongoDB tokens
    const result = await uploadYoutubeVideo({
      videoPath,
      metadata,
      tokens: account.tokens?.toObject?.() || account.tokens,
    });

    if (!result?.id) {
      throw new Error("YouTube upload completed without returning a video ID.");
    }

    // Save upload state
    reel.youtube = {
      status: "uploaded",
      videoId: result.id,
      url: `https://youtube.com/watch?v=${result.id}`,
      uploadedAt: new Date().toISOString(),
    };

    await fsExtra.writeJson(reelJsonPath, reel, {
      spaces: 2,
    });

    res.json({
      success: true,
      reelId: id,
      videoId: result.id,
      url: `https://youtube.com/watch?v=${result.id}`,
    });
  } catch (err) {
    console.error("Manual YouTube upload failed:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}