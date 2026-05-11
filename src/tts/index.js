import fs from "fs";
import path from "path";
import axios from "axios";
import { OUTPUT_DIR } from "../utils/paths.js";
// 👇 ADD THIS HERE
function splitText(text, maxLength = 180) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];

  let current = "";

  for (let sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
// 👇 YOUR MAIN FUNCTION (REPLACE OLD ONE)
export async function generateSpeech(text) {
  const filePath = path.join(OUTPUT_DIR, "audio.mp3");

  const chunks = splitText(text); // 👈 uses helper

  const writer = fs.createWriteStream(filePath);

  for (let chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      chunk
    )}&tl=en&client=tw-ob`;

    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    await new Promise((resolve, reject) => {
      response.data.pipe(writer, { end: false });
      response.data.on("end", resolve);
      response.data.on("error", reject);
    });
  }

  writer.end();
  console.log(`Improved TTS audio created: ${filePath}`);
  return filePath;
}

