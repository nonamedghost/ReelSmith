import fs from "fs";
import { google } from "googleapis";
import { getAuthUrl, saveToken, oauth2Client } from "../../youtube/auth.js";

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