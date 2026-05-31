import { fetchBackgroundVideo } from "../fetchBackground.js";

export default {
  async generate(query) {
    return await fetchBackgroundVideo(query);
  }
};