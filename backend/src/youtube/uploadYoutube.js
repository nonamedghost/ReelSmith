import fs from "fs";
import { google } from "googleapis";
import { createOAuthClient } from "./auth.js";

export async function uploadYoutubeVideo({
  videoPath,
  metadata,
  tokens,
}) {
  if (!tokens?.access_token && !tokens?.refresh_token) {
    throw new Error("YouTube authentication tokens are missing.");
  }

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);

  // Create youtube client
  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  console.log("Starting YouTube upload...");

  // Upload video
  const response = await youtube.videos.insert({
    part: ["snippet", "status"],

    requestBody: {
      snippet: {
        title: metadata.title,

        description: `
          ${metadata.description}

          ${(metadata.hashtags || []).join(" ")}
        `,

        tags: metadata.tags || [],

        // Education / Science
        categoryId: "28",
      },

      status: {
        privacyStatus: "unlisted",
        selfDeclaredMadeForKids: false,
      },
    },

    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = response.data.id;

  console.log(
    "Upload complete:",
    `https://youtube.com/watch?v=${videoId}`
  );

  return response.data;
}