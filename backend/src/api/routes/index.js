
import { Router } from "express";

import { getHealth } from "../controllers/healthController.js";
import { generateReel } from "../controllers/reelController.js";
import { getTopic } from "../controllers/topicController.js";

import { getYoutubeStatus, getYoutubeAuthUrl, disconnectYoutube, youtubeCallback, uploadReelToYoutube, } from "../controllers/youtubeController.js";

import { getReels, getLatestReel, deleteReel, streamReel, downloadReel, streamThumbnail, } from "../controllers/libraryController.js";

import { getSettings, saveSettings, } from "../controllers/settingsController.js";

import { streamProgress } from "../controllers/progressController.js";

import { register, login, getMe, loginWithGoogle, } from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Health
router.get("/health", getHealth);

// Authentication
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/google", loginWithGoogle);
router.get("/auth/me", protect, getMe);

// Reel generation
router.post("/reels/generate", protect, generateReel);
router.get("/reels/progress/:jobId", protect, streamProgress);

// Topics
router.get("/topics/random", getTopic);

// Library
router.get("/reels", protect, getReels);
router.get("/reels/latest", protect, getLatestReel);
router.get("/reels/video/:id", protect, streamReel);
router.get("/reels/thumbnail/:id", protect, streamThumbnail);
router.get("/reels/download/:id", protect, downloadReel);
router.delete("/reels/:id", protect, deleteReel);

// Manual YouTube upload
router.post("/reels/:id/upload", protect, uploadReelToYoutube);

// Settings
router.get("/settings", protect, getSettings);
router.post("/settings", protect, saveSettings);

// YouTube
router.get("/youtube/status", protect, getYoutubeStatus);

router.get("/youtube/auth-url", protect, getYoutubeAuthUrl);

// Callback remains public because Google redirects here
router.get("/youtube/callback", youtubeCallback);

router.post("/youtube/disconnect", protect, disconnectYoutube);

export default router;