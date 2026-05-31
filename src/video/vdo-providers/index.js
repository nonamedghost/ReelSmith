import pexelsProvider from "./pexelsProvider.js";

const MODE = "pexels";

export function getVideoProvider() {
  switch (MODE) {
    case "pexels":
    default:
      return pexelsProvider;
  }
}