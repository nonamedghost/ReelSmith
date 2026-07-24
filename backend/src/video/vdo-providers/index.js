import pexelsProvider from "./pexelsProvider.js";
import veoProvider from "./veoProvider.js";

export const MODE = "veo"; // change later if needed

export function getVideoProvider() {
  switch (MODE) {
    case "veo":
      return veoProvider;

    case "pexels":
    default:
      return pexelsProvider;
  }
}