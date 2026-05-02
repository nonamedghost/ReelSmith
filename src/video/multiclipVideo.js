import path from "path";
import fs from "fs-extra";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import { OUTPUT_DIR } from "../utils/paths.js";

// Set ffmpeg paths
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Final output file
const OUTPUT_FILE = path.join(OUTPUT_DIR, "video.mp4");

/**
 * Main function to generate merged video
 * @param {string} audioPath - Path to audio file
 * @param {string} subtitlePath - Path to subtitles file
 * @param {string[]} clipPaths - Array of video clip paths
 */

async function normalizeClip(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime(0)     // start from beginning
      .setDuration(3)      // 👈 ONLY 3 seconds
      .videoFilters([
        "scale=1080:1920:force_original_aspect_ratio=increase",
        "crop=1080:1920",
        "fps=30",
        "format=yuv420p"
      ])
      .outputOptions([
        "-c:v libx264",
        "-preset veryfast",
        "-crf 23",
        "-an"
      ])
      .on("end", resolve)
      .on("error", reject)
      .save(output);
  });
}

export async function generateMergedVideo(audioPath, subtitlePath, clipPaths) {
  // ================================
  // STEP 0: VALIDATION
  // ================================

  if (!audioPath || typeof audioPath !== "string") {
    throw new Error("Invalid audio path");
  }

  if (!Array.isArray(clipPaths) || clipPaths.length === 0) {
    throw new Error("No clips provided");
  }

  // Validate files exist
  if (!(await fs.pathExists(audioPath))) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  for (const clip of clipPaths) {
    if (!(await fs.pathExists(clip))) {
      throw new Error(`Clip not found: ${clip}`);
    }
  }

  await fs.ensureDir(OUTPUT_DIR);

  // ================================
  // 🔥 STEP 0.5: NORMALIZE CLIPS
  // ================================

  const normalizedClips = [];

  for (let i = 0; i < clipPaths.length; i++) {
    const out = path.join(OUTPUT_DIR, `norm_${i}.mp4`);
    console.log(`Normalizing clip ${i + 1}...`);
    
    await normalizeClip(clipPaths[i], out);
    normalizedClips.push(out);
  }

  // Fix subtitle path (important for Windows ffmpeg)
  const safeSubtitlePath = subtitlePath
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:")

  // ================================
  // STEP 1: CREATE CONCAT FILE
  // ================================

  // FFmpeg requires a text file listing clips
  const concatFile = path.join(OUTPUT_DIR, "concat.txt");

  //const concatContent = clipPaths
  const concatContent = normalizedClips
    .map((clip) => `file '${clip.replace(/\\/g, "/")}'`)
    .join("\n");

  await fs.writeFile(concatFile, concatContent);

  // ================================
  // STEP 2: MERGE CLIPS (NO ENCODING ⚡)
  // ================================

  const mergedVideo = path.join(OUTPUT_DIR, "merged.mp4");

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFile)
      .inputOptions(["-f concat", "-safe 0"])

      // 🔥 IMPORTANT:
      // -c copy = NO re-encoding → super fast + low CPU
      .outputOptions([
        "-c copy",
        "-fflags +genpts"
      ])

      .on("start", () => console.log("Merging clips (fast mode)..."))
      .on("end", () => {
        console.log("Clips merged successfully ✅");
        resolve();
      })
      .on("error", (err) => reject(err))
      .save(mergedVideo);
  });

  // ================================
  // STEP 3: FINAL ENCODE (GPU + SUBS + AUDIO)
  // ================================

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(mergedVideo) // merged video
      .input(audioPath)   // audio

      .videoFilters([
        "scale=720:1280",
        // 🔥 Normalize format FIRST
        //"fps=30",
        "format=yuv420p",

        // Then apply subtitles
        `subtitles='${safeSubtitlePath}'`,
        
      ])

      .outputOptions([
        // Map video + audio
        "-map 0:v:0",
        "-map 1:a:0",

        // 🔥 GPU encoding (uses NVIDIA)
        // "-c:v h264_nvenc",

        // Speed vs quality tradeoff
        // "-preset fast",

        "-c:v libx264",
        "-preset veryfast",
        "-crf 23",

        // 🔥 FIX: safer NVENC settings
        //"-c:v h264_nvenc",
        //"-preset fast",
        //"-preset p4",          // instead of "fast"
        //"-profile:v main",
        //"-r 30",
        // "-pix_fmt yuv420p",

        // Audio codec
        "-c:a aac",

        // Ensure video stops when audio ends
        "-shortest",
      ])

      .on("start", () => console.log("Final encoding started (GPU)..."))

      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`Encoding: ${progress.percent.toFixed(1)}%`);
        }
      })

      .on("end", () => {
        console.log(`Final video created: ${OUTPUT_FILE}`);
        resolve(OUTPUT_FILE);
      })

      .on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      })

      .save(OUTPUT_FILE);  // no .run() needed
  });
}