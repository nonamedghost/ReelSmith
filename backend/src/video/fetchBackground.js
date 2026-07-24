import { PATHS } from "../utils/paths.js";
import pexelsProvider from "./vdo-providers/pexelsProvider.js"
import {getNextClipPath, downloadFile,} from "./utils/videoStorage.js";
import {selectUniqueVideo,} from "./utils/videoSelector.js";

// 🎬 MAIN FUNCTION
// Fetches a UNIQUE background video from Pexels
export async function fetchBackgroundVideo(query = "nature") {

    try {

        // 🔍 STEP 1: SEARCH PEXELS
        const videos = await pexelsProvider.searchVideos(query);

        if (!videos || videos.length === 0) {
            throw new Error("No videos returned from Pexels");
        }

        console.log(`🔎 Found ${videos.length} videos for: "${query}"`);

        // 🎯 STEP 2: SELECT UNIQUE VIDEO
        // Uses global deduplication
        const selected = selectUniqueVideo(videos);

        if (!selected) {
            throw new Error("No unique video found");
        }

        const videoUrl = selected.file.link;
        console.log(`🎬 Selected video ID: ${selected.video.id}`);

        // 📁 STEP 3: CREATE FILE PATH
        const filePath = getNextClipPath(PATHS);

        // ⬇️ STEP 4: DOWNLOAD VIDEO
        await downloadFile(
            videoUrl,
            filePath
        );

        // ✅ STEP 5: COMPLETE
        console.log("✅ Background video downloaded:",filePath);

        return filePath;

    } catch (err) {
        console.error("❌ Pexels fetch failed:",err.message);
        throw err;
    }
}