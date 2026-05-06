import fs from "fs";

import {
  OUTPUT_DIR,
  TEMP_DIR,
  CLIPS_DIR,
  FINAL_DIR,
} from "./paths.js";

const folders = [
  TEMP_DIR,
  CLIPS_DIR,
  FINAL_DIR,
];

export default function cleanup() {
  console.log("🧹 Cleaning output folders...");

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