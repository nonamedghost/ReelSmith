import fs from "fs";
import { PATHS } from "./paths.js";

export default function validateOutput() {
  const errors = [];

  // CHECK 1 — Final video exists
  if (!fs.existsSync(PATHS.finalVideo)) {
    errors.push("Final video is missing.");
  } else {
    // CHECK 2 — File size > 0
    const stats = fs.statSync(PATHS.finalVideo);

    if (stats.size <= 0) {
      errors.push("Final video file is empty.");
    }
  }

  // CHECK 3 — Metadata exists
  if (!fs.existsSync(PATHS.metadata)) {
    errors.push("metadata.json is missing.");
  }

  // CHECK 4 — Subtitles exist
  if (!fs.existsSync(PATHS.subtitles)) {
    errors.push("subtitles.srt is missing.");
  }

  // FINAL RESULT
  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    errors: [],
  };
}