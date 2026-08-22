import fs from "fs";
import fsExtra from "fs-extra";
import path from "path";
import { google } from "googleapis";
import { getAuthUrl, saveToken, oauth2Client } from "../../youtube/auth.js";
import { uploadYoutubeVideo } from "../../youtube/uploadYoutube.js";
import { LIBRARY_DIR } from "../../utils/paths.js";

export async function getYoutubeStatus(req, res) {
  try {
    // No token = not connected
    if (!fs.existsSync("token.json")) {
      return res.json({
        success: true,
        youtube: {
          connected: false,
          channelName: null,
          avatarUrl: null,
        },
      });
    }

    // Load saved token
    const token = JSON.parse(
      fs.readFileSync("token.json", "utf8")
    );

    oauth2Client.setCredentials(token);

    // Create YouTube client
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Fetch current channel
    const response = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    const channel = response.data.items?.[0];

    if (!channel) {
      throw new Error("No YouTube channel found.");
    }

    res.json({
      success: true,
      youtube: {
        connected: true,
        channelName: channel.snippet.title,
        avatarUrl: channel.snippet.thumbnails.default.url,
      },
    });

  } catch (err) {
    console.error("Failed to get YouTube status:", err);

    res.json({
      success: true,
      youtube: {
        connected: false,
        channelName: null,
        avatarUrl: null,
      },
    });
  }
}

export async function getYoutubeAuthUrl(req, res) {
  try {
    const url = getAuthUrl();

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
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Missing authorization code.");
    }

    await saveToken(code);

    res.redirect(`${process.env.FRONTEND_URL}/settings`);
  } catch (err) {
    console.error("YouTube OAuth callback failed:", err);

    res.status(500).send("YouTube authentication failed.");
  }
}

export async function disconnectYoutube(req, res) {
  try {
    if (fs.existsSync("token.json")) {
      fs.unlinkSync("token.json");
    }

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

    // Check YouTube authentication
    if (!fs.existsSync("token.json")) {
      return res.status(401).json({
        success: false,
        error: "YouTube is not connected.",
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

    // Resolve video path using the same structure as Library
    const videoPath = path.join(
      reelDir,
      reel.files.video
    );

    if (!(await fsExtra.pathExists(videoPath))) {
      return res.status(404).json({
        success: false,
        error: "Video file not found.",
      });
    }

    // Load existing metadata
    if (!(await fsExtra.pathExists(metadataPath))) {
      return res.status(404).json({
        success: false,
        error: "Metadata file not found.",
      });
    }

    const metadata = await fsExtra.readJson(metadataPath);

    console.log(`Starting manual YouTube upload for reel: ${id}`);

    // Reuse existing YouTube uploader
    const result = await uploadYoutubeVideo({
      videoPath,
      metadata,
    });

    // Save upload state back into reel.json
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