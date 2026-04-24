import 'dotenv/config';
import { ensureDirectories } from './utils/paths.js';
import { generateScript } from './script/generateScriptAI.js';
import { generateScriptDummy } from './script/index.js';
// import { generateSpeech } from './tts/index.js';
import { generateVideo } from './video/index.js';

// NEW ✅
import { generateSpeech } from "./tts/deepgramTTS.js";
import { transcribeAudio } from "./subtitles/deepgramSTT.js";
import { generateSRT } from "./subtitles/generateSRT.js";

import { fetchBackgroundVideo } from './video/fetchBackground.js';

async function main() {
  await ensureDirectories();

  console.log('Reels Generator started.');

  // Step 1: Generate script

  const topics = ["space facts", "animal facts", "science facts"];

  const topic = topics[Math.floor(Math.random() * topics.length)];

  const USE_AI = true;

  let script;

  try {
    script = USE_AI
      ? await generateScript(topic)
      : generateScriptDummy();
  } catch (err) {
    console.log("AI failed, using fallback...");
    script = generateScriptDummy();
  }

    console.log("Topic:", topic);
    console.log("Script:", script);


  // Step 2: Generate speech from script (TTS)

  const audio = await generateSpeech(script);
  console.log("Audio path:", audio);


  // Step 2.5: Generate subtitles
  const words = await transcribeAudio(audio);
  const subtitles = generateSRT(words);
  console.log("Subtitles path:", subtitles);


  // Step 2.7: Fetch background video
  const bgVideo = await fetchBackgroundVideo(topic);
  console.log("Background video path:", bgVideo);



  // Step 3: Generate video with audio (VIDEO)

  const video = await generateVideo(audio, subtitles, bgVideo);
  console.log("Video path:", video);

  console.log('Pipeline complete.');
}

main().catch(console.error);

