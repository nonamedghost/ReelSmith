import fs from "fs";
import { PATHS } from "../utils/paths.js";

// Default Deepgram voice model used for TTS
const DEFAULT_VOICE_MODEL = "aura-2-thalia-en";

export async function generateSpeech(text, voice = DEFAULT_VOICE_MODEL) {
  const filePath = PATHS.audio;

  const selectedVoice = voice || DEFAULT_VOICE_MODEL;

  // Flux uses /v2/speak.
  // Aura and Aura-2 use /v1/speak.
  const isFlux = selectedVoice.startsWith("flux-");

  const endpoint = isFlux
    ? `https://api.deepgram.com/v2/speak?model=${encodeURIComponent(selectedVoice)}&encoding=mp3`
    : `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(selectedVoice)}&encoding=mp3`;

  console.log(`🎙️ Generating speech with: ${selectedVoice}`);
  console.log(`🔗 Deepgram endpoint: ${isFlux ? "/v2/speak" : "/v1/speak"}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("❌ Deepgram TTS error:");
    console.error(errorText);

    throw new Error(
      `Deepgram TTS failed (${response.status}): ${errorText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(filePath, buffer);

  console.log(`✅ Deepgram TTS done: ${filePath}`);

  return {
    filePath,
    voice: selectedVoice,
  };
}