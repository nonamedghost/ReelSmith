/**
 * Search Pexels videos
 * Returns raw Pexels video objects
 */

import axios from "axios";
import { fetchBackgroundVideo } from "../fetchBackground.js";
// 🔐 API KEY
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export default {
  type: "stock",
  
  async generate(query) {
    return await fetchBackgroundVideo(query);
  },

  // Search raw videos from Pexels API
  async searchVideos(query) {

    const url =
      `https://api.pexels.com/videos/search?query=${query}&per_page=5&orientation=portrait`;

    const response = await axios.get(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    return response.data.videos;
  },
};
