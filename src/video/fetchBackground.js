// ===============================
// 📦 IMPORTS
// ===============================
import fs from "fs";
import axios from "axios";
import { PATHS } from "../utils/paths.js";

// ===============================
// 🔐 API KEY
// ===============================
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// ===============================
// 🧠 GLOBAL TRACKING (DEDUPLICATION)
// Prevents same video being reused
// ===============================
const usedVideoIds = new Set();
const usedVideoUrls = new Set();

// ===============================
// 🔢 SIMPLE COUNTER FOR FILE NAMES
// ===============================
let clipCounter = 0;

// ===============================
// 🎬 MAIN FUNCTION
// Fetches a UNIQUE background video
// ===============================
export async function fetchBackgroundVideo(query = "nature") {
  try {
    clipCounter++;

    // ===============================
    // 🌐 STEP 1: CALL PEXELS API
    // ===============================
    const url = `https://api.pexels.com/videos/search?query=${query}&per_page=5&orientation=portrait`;

    const response = await axios.get(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    const videos = response.data.videos;

    if (!videos || videos.length === 0) {
      throw new Error("No videos returned from Pexels");
    }

    // ===============================
    // 🔍 STEP 2: FIND UNIQUE VIDEO
    // Avoid duplicates using:
    // - video.id
    // - video file URL
    // ===============================
    let selectedVideo = null;
    let selectedFile = null;

    for (const video of videos) {
      // pick best available file
      const file =
        video.video_files.find((f) => f.height >= 1920 && f.link) ||
        video.video_files.find((f) => f.link);

      if (!file) continue;

      const videoUrl = file.link;

      // check uniqueness
      if (!usedVideoIds.has(video.id) && !usedVideoUrls.has(videoUrl)) {
        usedVideoIds.add(video.id);
        usedVideoUrls.add(videoUrl);

        selectedVideo = video;
        selectedFile = file;
        break;
      }
    }

    // ===============================
    // ⚠️ STEP 3: FALLBACK IF NO UNIQUE
    // ===============================
    if (!selectedVideo || !selectedFile) {
      console.log("⚠️ No unique video found, using fallback...");

      selectedVideo = videos[0];

      selectedFile =
        selectedVideo.video_files.find((f) => f.height >= 1920 && f.link) ||
        selectedVideo.video_files.find((f) => f.link);

      if (!selectedFile) {
        throw new Error("No valid video file found in fallback");
      }
    }

    const videoUrl = selectedFile.link;

    // ===============================
    // 📁 STEP 4: CREATE FILE PATH
    // ===============================
    const filePath = PATHS.getBg(clipCounter);

    // ===============================
    // ⬇️ STEP 5: DOWNLOAD VIDEO
    // ===============================
    const res = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
      res.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("✅ Background video downloaded:", filePath);

    return filePath;

  } catch (err) {
    console.error("❌ Pexels fetch failed:", err.message);
    throw err;
  }
}