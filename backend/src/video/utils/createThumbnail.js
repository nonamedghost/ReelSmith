import path from "path";
import fs from "fs-extra";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import { PATHS } from "../../utils/paths.js";

// Configure FFmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * Creates a thumbnail from a video.
 *
 * @param {string} videoPath - Full path to the video
 * @returns {Promise<string>} Full thumbnail path
 */
export async function createThumbnail(videoPath) {

  const thumbnailPath = PATHS.thumbnail;

  await fs.ensureDir(path.dirname(thumbnailPath));

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on("end", () => {
        console.log("🖼 Thumbnail created:", thumbnailPath);
        resolve(thumbnailPath);
      })
      .on("error", (err) => {
        reject(err);
      })
      .screenshots({
        count: 1,
        timemarks: ["15%"],
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: "540x960",
      });
  });
}