import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import { generateReel } from "../controllers/reelController.js";
import { getTopic } from "../controllers/topicController.js";
import { getYoutubeStatus, getYoutubeAuthUrl, disconnectYoutube, youtubeCallback, uploadReelToYoutube } from "../controllers/youtubeController.js";
import { getReels, getLatestReel, deleteReel, streamReel, downloadReel, streamThumbnail } from "../controllers/libraryController.js";
import { getSettings, saveSettings } from "../controllers/settingsController.js";
import { streamProgress } from "../controllers/progressController.js";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/health", getHealth);

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", protect, getMe);

router.post("/reels/generate", protect, generateReel);
router.get("/reels/progress/:jobId", protect, streamProgress);

router.get("/topics/random", getTopic);

router.get("/reels", protect, getReels);
router.get("/reels/latest", protect, getLatestReel);
router.get("/reels/video/:id", protect, streamReel);
router.get("/reels/thumbnail/:id", protect, streamThumbnail);
router.get("/reels/download/:id", protect, downloadReel);
router.delete("/reels/:id", protect, deleteReel);

router.post("/reels/:id/upload", protect, uploadReelToYoutube);

router.get("/settings", getSettings);
router.post("/settings", saveSettings);

router.get("/youtube/status", getYoutubeStatus);
router.get("/youtube/auth-url", getYoutubeAuthUrl);
router.get("/youtube/callback", youtubeCallback);
router.post("/youtube/disconnect", disconnectYoutube);

export default router;