import fs from "fs-extra";
import path from "path";

import { LIBRARY_DIR } from "../../utils/paths.js";

async function loadLibrary() {
  const folders = await fs.readdir(LIBRARY_DIR);
  const reels = [];

  for (const folder of folders) {
    const reelPath = path.join(LIBRARY_DIR, folder, "reel.json");

    if (!(await fs.pathExists(reelPath))) {
      continue;
    }
    const reel = await fs.readJson(reelPath);
    reels.push(reel);
  }

  reels.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  return reels;
}


export async function getReels(req, res) {
  try {
    const reels = await loadLibrary();

    res.json({
      success: true,
      reels,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}


export async function getLatestReel(req, res) {
  try {
    const reels = await loadLibrary();

    res.json({
      success: true,
      reel: reels[0] ?? null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}


export async function deleteReel(req, res) {
  try {
    const { id } = req.params;
    // Reuse our helper
    const reels = await loadLibrary();
    const reel = reels.find(r => r.id === id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: "Reel not found",
      });
    }
    // Actually delete the folder
    await fs.remove(path.join(LIBRARY_DIR, reel.id));

    res.json({
      success: true,
      deleted: id,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}