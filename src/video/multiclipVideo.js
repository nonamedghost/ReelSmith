// ===============================
// 📦 IMPORTS
// ===============================
import path from "path";
import fs from "fs-extra";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import { OUTPUT_DIR } from "../utils/paths.js";

// ===============================
// ⚙️ SETUP FFMPEG PATHS
// ===============================
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// ===============================
// 📁 FINAL OUTPUT FILE
// ===============================
const OUTPUT_FILE = path.join(OUTPUT_DIR, "video.mp4");

// ===============================
// 🔍 GET AUDIO DURATION (IMPORTANT)
// Used to sync video length with audio
// ===============================
function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration); // in seconds
    });
  });
}

// ===============================
// 🎬 NORMALIZE SINGLE CLIP
// - Resizes to vertical (1080x1920)
// - Locks FPS to 30
// - Removes audio
// - Optionally loops if only 1 clip
// ===============================
async function normalizeClip(input, output, duration, shouldLoop) {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(input)
      .setStartTime(0)
      .videoFilters([
        "scale=1080:1920:force_original_aspect_ratio=increase",
        "crop=1080:1920",
        "fps=30",
      ])
      .outputOptions([
        "-c:v libx264",        // encode video
        "-preset veryfast",    // balance speed vs quality
        "-crf 28",             // higher = less CPU usage
        "-pix_fmt yuv420p",    // compatibility
        "-r 30",               // enforce FPS
        "-an",                 // remove audio
      ]);

    // 🔁 LOOP ONLY IF SINGLE CLIP
    if (shouldLoop) {
      command = command.inputOptions(["-stream_loop -1"]);
    }

    command
      .setDuration(duration) // trim to match audio or portion
      .on("end", resolve)
      .on("error", reject)
      .save(output);
  });
}

// ===============================
// 🧠 MAIN FUNCTION
// ===============================
export async function generateMergedVideo(audioPath, subtitlePath, clipPaths) {

  // ===============================
  // 🛑 VALIDATION
  // ===============================
  if (!audioPath || typeof audioPath !== "string") {
    throw new Error("Invalid audio path");
  }

  if (!Array.isArray(clipPaths) || clipPaths.length === 0) {
    throw new Error("No clips provided");
  }

  if (!(await fs.pathExists(audioPath))) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  for (const clip of clipPaths) {
    if (!(await fs.pathExists(clip))) {
      throw new Error(`Clip not found: ${clip}`);
    }
  }

  await fs.ensureDir(OUTPUT_DIR);

  // ===============================
  // ⏱️ CALCULATE DURATIONS
  // ===============================
  const totalDuration = await getAudioDuration(audioPath);
  const clipsCount = clipPaths.length;

  // If only 1 clip → full duration (loop mode)
  // Else → divide evenly
  const clipDuration =
    clipsCount === 1
      ? totalDuration
      : totalDuration / clipsCount;

  console.log(`Total audio duration: ${totalDuration}s`);
  console.log(`Clip duration: ${clipDuration}s`);

  // ===============================
  // 🎬 STEP 1: NORMALIZE CLIPS
  // ===============================
  const normalizedClips = [];

  for (let i = 0; i < clipPaths.length; i++) {
    const input = clipPaths[i];
    const output = path.join(OUTPUT_DIR, `norm_${i}.mp4`);

    console.log(`Normalizing clip ${i + 1}...`);

    await normalizeClip(
      input,
      output,
      clipDuration,
      clipsCount === 1 // loop if only one clip
    );

    normalizedClips.push(output);
  }

  // ===============================
  // 📝 STEP 2: CREATE CONCAT FILE
  // ===============================
  const concatFile = path.join(OUTPUT_DIR, "concat.txt");

  const concatContent = normalizedClips
    .map((clip) => `file '${clip.replace(/\\/g, "/")}'`)
    .join("\n");

  await fs.writeFile(concatFile, concatContent);

  // ===============================
  // 🔗 STEP 3: MERGE CLIPS (FAST MODE)
  // Uses copy since clips are already normalized
  // ===============================
  const mergedVideo = path.join(OUTPUT_DIR, "merged.mp4");

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFile)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions([
        "-c copy",             // no re-encoding → fast
        "-fflags +genpts",     // fix timestamps
      ])
      .on("start", () => console.log("Merging clips..."))
      .on("end", () => {
        console.log("Clips merged successfully");
        resolve();
      })
      .on("error", reject)
      .save(mergedVideo);
  });

  // ===============================
  // 🎯 STEP 4: FINAL ENCODE
  // - Adds audio
  // - Adds subtitles
  // - Ensures format consistency
  // ===============================
  const safeSubtitlePath = subtitlePath
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:");

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(mergedVideo)
      .input(audioPath)
      .videoFilters([
        "scale=1080:1920",
        "fps=30",
        "format=yuv420p",
        `subtitles='${safeSubtitlePath}'`,
      ])
      .outputOptions([
        "-map 0:v:0",         // video
        "-map 1:a:0",         // audio

        "-c:v libx264",
        "-preset ultrafast",  // best for weak CPU
        "-crf 28",

        "-c:a aac",

        "-r 30",
        "-shortest",          // match audio length
      ])
      .on("start", () => console.log("Final encoding started..."))
      .on("progress", (p) => {
        if (p.percent) {
          console.log(`Encoding: ${p.percent.toFixed(1)}%`);
        }
      })
      .on("end", () => {
        console.log("Final video created:", OUTPUT_FILE);
        resolve();
      })
      .on("error", reject)
      .save(OUTPUT_FILE);
  });

  return OUTPUT_FILE;
}