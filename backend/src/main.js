import "dotenv/config";
import { runPipeline } from "./pipeline/runPipeline.js";

runPipeline().catch(console.error);
