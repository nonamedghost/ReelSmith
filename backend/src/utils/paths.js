import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, "..", "..");

export const OUTPUT_DIR = path.join(ROOT_DIR, "output");
export const ASSETS_DIR = path.join(ROOT_DIR, "assets");

// 🔥 NEW STRUCTURE
export const TEMP_DIR = path.join(OUTPUT_DIR, "temp");
export const CLIPS_DIR = path.join(OUTPUT_DIR, "clips");
export const FINAL_DIR = path.join(OUTPUT_DIR, "final");
export const LOGS_DIR = path.join(OUTPUT_DIR, "logs");

export const LIBRARY_DIR = path.join(OUTPUT_DIR, "library");

// 🎯 FILE PATH HELPERS
export const PATHS = {
  audio: path.join(TEMP_DIR, "audio.mp3"),

  getBg: (i) => path.join(TEMP_DIR, `bg_${i}.mp4`),

  getClip: (i) => path.join(CLIPS_DIR, `norm_${i}.mp4`),

  concat: path.join(CLIPS_DIR, "concat.txt"),

  merged: path.join(FINAL_DIR, "merged.mp4"),
  metadata: path.join(FINAL_DIR, "metadata.json"),
  subtitles: path.join(FINAL_DIR, "subtitles.srt"),
  finalVideo: path.join(FINAL_DIR, "video.mp4"),
  thumbnail: path.join(FINAL_DIR, "thumbnail.jpg"),
};

// ✅ Ensure all folders exist
export async function ensureDirectories() {
  await fs.ensureDir(TEMP_DIR);
  await fs.ensureDir(CLIPS_DIR);
  await fs.ensureDir(FINAL_DIR);
  await fs.ensureDir(LOGS_DIR);

  await fs.ensureDir(LIBRARY_DIR);
}
