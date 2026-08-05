import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import { generateReel } from "../controllers/reelController.js";
import { getTopic } from "../controllers/topicController.js";
import { getYoutubeStatus, getYoutubeAuthUrl, disconnectYoutube, youtubeCallback } from "../controllers/youtubeController.js";
import { getReels, getLatestReel, deleteReel, streamReel, downloadReel, streamThumbnail } from "../controllers/libraryController.js";
import { getSettings, saveSettings } from "../controllers/settingsController.js";

const router = Router();

router.get("/health", getHealth);

router.post("/reels/generate", generateReel);

router.get("/topics/random", getTopic);

router.get("/reels", getReels);
router.get("/reels/latest", getLatestReel);
router.get("/reels/video/:id", streamReel);
router.get("/reels/thumbnail/:id", streamThumbnail);
router.get("/reels/download/:id", downloadReel);
router.delete("/reels/:id", deleteReel);

router.get("/settings", getSettings);
router.post("/settings", saveSettings);

router.get("/youtube/status", getYoutubeStatus);
router.get("/youtube/auth-url", getYoutubeAuthUrl);
router.get("/youtube/callback", youtubeCallback);
router.post("/youtube/disconnect", disconnectYoutube);

export default router;