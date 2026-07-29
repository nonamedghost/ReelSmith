import fs from "fs-extra";
import path from "path";
import { FINAL_DIR, LIBRARY_DIR } from "./paths.js";
import { saveJson } from "./saveJson.js";

//  * Create timestamp: Example: 29-07_09-45-12
function createArchiveId() {
  const now = new Date();

  const dd = String(now.getDate()).padStart(2, "0");
  const MM = String(now.getMonth() + 1).padStart(2, "0");

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `${dd}-${MM}_${hh}-${mm}-${ss}`;
}

// Archive a completed reel.
export async function archiveGeneration({
  topic,
  category,
  provider,
  duration,
  youtube = {},
}) {
  const archiveId = createArchiveId();

  const archiveDir = path.join(LIBRARY_DIR, archiveId);

  // Copy everything from output/final -> output/library/<archiveId>
  await fs.copy(FINAL_DIR, archiveDir);

  // Backend metadata
  const reelData = {
    id: archiveId,

    createdAt: getISTTimestamp(),

    topic,
    category,
    provider,
    duration,

    pipelineStatus: "completed",

    files: {
      video: "video.mp4",
      merged: "merged.mp4",
      metadata: "metadata.json",
      subtitle: "subtitles.srt",
    },

    youtube: {
      requested: youtube.requested ?? false,
      status: youtube.status ?? "not_requested",
      videoId: youtube.videoId ?? null,
      url: youtube.url ?? null,
      uploadedAt: youtube.uploadedAt ?? null,
      error: youtube.error ?? null,
    },
  };

  saveJson(path.join(archiveDir, "reel.json"), reelData);

  return {
    success: true,
    id: archiveId,
  };
}

// Create youtube info from upload result
export function createYoutubeInfo({
  requested = false,
  uploadResult = null,
  error = null,
}) {
  if (!requested) {
    return {
      requested: false,
      status: "not_requested",
      videoId: null,
      url: null,
      error: null,
      uploadedAt: null,
    };
  }

  if (error) {
    return {
      requested: true,
      status: "failed",
      videoId: null,
      url: null,
      uploadedAt: null,
      error: error.message,
    };
  }

  return {
    requested: true,
    status: "uploaded",
    videoId: uploadResult.id,
    url: uploadResult ? `https://youtu.be/${uploadResult.id}` : null,
    uploadedAt: getISTTimestamp(),
    error: null,
  };
}
// Returns the current date and time in IST.
function getISTTimestamp() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}