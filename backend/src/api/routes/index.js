import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import { generateReel } from "../controllers/reelController.js";

const router = Router();

router.get("/health", getHealth);
router.post("/reels/generate", generateReel);

export default router;