import fs from "fs";
import path from "path";
import { OUTPUT_DIR } from "../utils/paths.js";

function formatTime(seconds) {
  const date = new Date(seconds * 1000);
  return date.toISOString().substring(11, 23).replace(".", ",");
}

export function generateSRT(words) {
  const filePath = path.join(OUTPUT_DIR, "subtitles.srt");

  let srt = "";
  let index = 1;

  for (let i = 0; i < words.length; i += 5) {
    const chunk = words.slice(i, i + 5);

    const start = formatTime(chunk[0].start);
    const end = formatTime(chunk[chunk.length - 1].end);

    const text = chunk.map(w => w.word).join(" ");

    srt += `${index}\n${start} --> ${end}\n${text}\n\n`;
    index++;
  }

  fs.writeFileSync(filePath, srt);
  console.log("SRT created:", filePath);

  return filePath;
}