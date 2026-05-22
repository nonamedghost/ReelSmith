import fs from "fs";
import path from "path";
import { LOGS_DIR } from "./paths.js";

const logFile = path.join(LOGS_DIR, "logs.txt");

function write(level, message) {
  const timestamp = new Date().toISOString();

  const line = `[${timestamp}] [${level}] ${message}`;

  // Console output
  console.log(line);

  // Save to logs.txt
  fs.appendFileSync(logFile, line + "\n");
}

export function logInfo(message) {
  write("INFO", message);
}

export function logError(message) {
  write("ERROR", message);
}

export function logWarn(message) {
  write("WARN", message);
}