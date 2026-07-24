import fs from "fs";
import path from "path";
import { LOGS_DIR } from "./paths.js";

const logFile = path.join(LOGS_DIR, "logs.txt");

function write(level, message) {
  const timestamp = new Date().toLocaleTimeString();
  const line = `[${level}] ${timestamp} | ${message}`;
  // Console output
  console.log(line);
  // Save to logs.txt
  fs.appendFileSync(logFile, line + "\n");
}

// START OF NEW PIPELINE RUN
export function logRunStart() {
  const line = `
==================================================
🚀 NEW PIPELINE RUN
${new Date().toLocaleString()}
`;
  console.log(line);
  fs.appendFileSync(logFile, line);
}

// END OF PIPELINE
export function logRunEnd(success = true) {
  const line = success
    ? `
✅ PIPELINE COMPLETED
${new Date().toLocaleString()}
==================================================
`
    : `
❌ PIPELINE FAILED
${new Date().toLocaleString()}
==================================================
`;
  console.log(line);
  fs.appendFileSync(logFile, line);
}

// NORMAL LOGS
export function logInfo(message) {
  write("ℹ️ INFO", message);
}
export function logError(message) {
  write("❌ ERROR", message);
}
export function logWarn(message) {
  write("⚠️ WARN", message);
}

export function logStepTime(step, startTime) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  write("ℹ️ INFO", `${step} completed in ${duration}s`);
}