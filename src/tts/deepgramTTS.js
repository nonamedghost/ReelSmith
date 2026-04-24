import fs from "fs";
import path from "path";
import { OUTPUT_DIR } from "../utils/paths.js";

export async function generateSpeech(text) {
  const filePath = path.join(OUTPUT_DIR, "audio.mp3");

  const response = await fetch(
    "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=mp3",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    }
  );

  if (!response.ok) {
    throw new Error("Deepgram TTS failed");
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(filePath, buffer);

  console.log("Deepgram TTS done:", filePath);
  return filePath;
}