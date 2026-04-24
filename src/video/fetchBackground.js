import fs from "fs";
import path from "path";
import axios from "axios";
import { OUTPUT_DIR } from "../utils/paths.js";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function fetchBackgroundVideo(query = "nature") {
  try {
    const url = `https://api.pexels.com/videos/search?query=${query}&per_page=1&orientation=portrait`;

    const response = await axios.get(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    const video = response.data.videos[0];

    if (!video) throw new Error("No video found");

    // pick best quality vertical file
    const file = video.video_files.find(f => f.height >= 1920) || video.video_files[0];

    const videoUrl = file.link;

    const filePath = path.join(OUTPUT_DIR, "bg.mp4");

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

    console.log("Background video downloaded:", filePath);

    return filePath;

  } catch (err) {
    console.error("Pexels fetch failed:", err.message);
    throw err;
  }
}