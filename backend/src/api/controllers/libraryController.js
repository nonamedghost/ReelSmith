import fs from "fs-extra";
import path from "path";

import { LIBRARY_DIR } from "../../utils/paths.js";

// to load all the reels in the library
async function loadLibrary(userId) {
  const folders = await fs.readdir(LIBRARY_DIR);
  const reels = [];

  for (const folder of folders) {
    const reelPath = path.join(LIBRARY_DIR, folder, "reel.json");

    if (!(await fs.pathExists(reelPath))) {
      continue;
    }
    const reel = await fs.readJson(reelPath);

    if (reel.userId !== userId) {
      continue;
    }

    reels.push({
      ...reel,

      youtubeUploadStatus:
        reel.youtube?.status === "uploaded" ? "success"
          : reel.youtube?.status === "failed" ? "failed"
            : "idle",

      youtubeVideoId: reel.youtube?.videoId ?? null,
    });
  }

  reels.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  return reels;
}

// to find a specific reel in the library
async function findReel(id, userId) {
  const reels = await loadLibrary(userId);
  return reels.find((r) => r.id === id);
}

// to get all reels in the library
export async function getReels(req, res) {
  try {
    const reels = await loadLibrary(req.user.userId);

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

// to get the latest reel from the library
export async function getLatestReel(req, res) {
  try {
    const reels = await loadLibrary(req.user.userId);

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

// to previw the reel in the library
export async function streamReel(req, res) {
  try {
    const { id } = req.params;

    const reel = await findReel(id, req.user.userId);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: "Reel not found",
      });
    }

    const videoPath = path.join(
      LIBRARY_DIR,
      reel.id,
      reel.files.video
    );

    if (!(await fs.pathExists(videoPath))) {
      return res.status(404).json({
        success: false,
        error: "Video file not found",
      });
    }

    res.sendFile(videoPath);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

// to preview the thumbnail in the library
export async function streamThumbnail(req, res) {
  try {
    const { id } = req.params;

    const reel = await findReel(id, req.user.userId);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: "Reel not found",
      });
    }

    const thumbnailPath = path.join(
      LIBRARY_DIR,
      reel.id,
      "thumbnail.jpg"
    );

    if (!(await fs.pathExists(thumbnailPath))) {
      return res.status(404).json({
        success: false,
        error: "Thumbnail not found",
      });
    }

    res.sendFile(thumbnailPath);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to load thumbnail",
    });
  }
}

// to download the reel from the library
export async function downloadReel(req, res) {
  try {
    const { id } = req.params;

    const reel = await findReel(id, req.user.userId);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: "Reel not found",
      });
    }

    const videoPath = path.join(
      LIBRARY_DIR,
      reel.id,
      reel.files.video
    );

    if (!(await fs.pathExists(videoPath))) {
      return res.status(404).json({
        success: false,
        error: "Video file not found",
      });
    }

    res.download(videoPath);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

// to delete the reel from the library
export async function deleteReel(req, res) {
  try {
    const { id } = req.params;
    const reel = await findReel(id, req.user.userId);

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