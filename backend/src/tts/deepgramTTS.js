import fs from "fs";
import { PATHS } from "../utils/paths.js";

// Deepgram voice model used for TTS
const VOICE_MODEL = "aura-2-thalia-en";

export async function generateSpeech(text) {
  const filePath = PATHS.audio;

  const response = await fetch(
    `https://api.deepgram.com/v1/speak?model=${VOICE_MODEL}&encoding=mp3`,
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
  return {
    filePath,
    voice: VOICE_MODEL,
  };
}