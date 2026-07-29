import fs from "fs";
import path from "path";

import {
  OUTPUT_DIR,
  TEMP_DIR,
  CLIPS_DIR,
  FINAL_DIR,
  LIBRARY_DIR
} from "./paths.js";

const folders = [
  TEMP_DIR,
  CLIPS_DIR,
  FINAL_DIR,
];

export default function cleanup() {
  // console.log("🧹 Cleaning output folders...");

  // Clean subfolders completely
  for (const folder of folders) {
    if (fs.existsSync(folder)) {
      fs.rmSync(folder, {
        recursive: true,
        force: true,
      });
    }

    fs.mkdirSync(folder, {
      recursive: true,
    });
  }

  // Clean loose files in output root
  const outputFiles = fs.readdirSync(OUTPUT_DIR);

  for (const file of outputFiles) {
    const filePath = `${OUTPUT_DIR}/${file}`;

    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  }

  console.log("✅ Cleanup done");
}

export function cleanupLibrary(maxReels = 10) {
  if (!fs.existsSync(LIBRARY_DIR)) return;

  const folders = fs.readdirSync(LIBRARY_DIR);
  // Nothing to clean
  if (folders.length <= maxReels) return;
  const reels = [];
  for (const folder of folders) {
    const reelPath = path.join(LIBRARY_DIR, folder, "reel.json");
    // Skip invalid folders
    if (!fs.existsSync(reelPath)) continue;
    try {
      const reel = JSON.parse(fs.readFileSync(reelPath, "utf8"));
      reels.push({
        folder,
        createdAt: reel.createdAt,
      });
    } catch {
      console.warn(`⚠️ Skipping invalid reel: ${folder}`);
    }
  }
  // Oldest first
  reels.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
  const deleteCount = reels.length - maxReels;

  console.log(`🗑 Cleaning Archive Library (${deleteCount} old reel${deleteCount > 1 ? "s" : ""})`);
  for (let i = 0; i < deleteCount; i++) {
    const folderPath = path.join(LIBRARY_DIR, reels[i].folder);
    fs.rmSync(folderPath, {
      recursive: true,
      force: true,
    });

    console.log(`🗑 Deleted old archived reel: ${reels[i].folder}`);
  }
}