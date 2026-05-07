import "dotenv/config";

import cleanup from "./utils/cleanup.js";
import { ensureDirectories } from "./utils/paths.js";

import { generateScript } from "./script/generateScriptAI.js";
import { generateScriptDummy } from "./script/index.js";

import { generateSpeech } from "./tts/deepgramTTS.js";
import { transcribeAudio } from "./subtitles/deepgramSTT.js";
import { generateSRT } from "./subtitles/generateSRT.js";

import { fetchBackgroundVideo } from "./video/fetchBackground.js";
import { generateSceneQueries } from "./script/generateSceneQueries.js";

import { generateMergedVideo } from "./video/multiclipVideo.js";

import { generateMetadata } from "./metadata/generateMetadata.js";
import { saveJson } from "./utils/saveJson.js";

// =======================
// MAIN PIPELINE
// =======================
async function main() {
  cleanup();              // clean temp, clips, final
  console.log("🧹 Fresh run started...");
  
  await ensureDirectories(); // recreate folders
  console.log("Reels Generator started.");

  // =======================
  // STEP 1: SCRIPT
  // =======================
  const topics = ["space facts", "animal facts", "science facts"];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  const USE_AI = true;

  let script;

  try {
    script = USE_AI
      ? await generateScript(topic)
      : generateScriptDummy();
  } catch (err) {
    console.log("Gemini ERROR:", err);
    console.log("AI failed, using fallback...");
    script = generateScriptDummy();
  }

  console.log("Topic:", topic);
  console.log("Script:", script);

  // ==============================
  // STEP X: GENERATE METADATA
  // ==============================

  const metadata = await generateMetadata(
    script,
    topic
  );
  console.log("Metadata:", metadata);

  saveJson(
    "output/final/metadata.json",
    metadata
  );
  console.log("Metadata saved.");

  // Add delay here
  await new Promise(resolve => setTimeout(resolve, 3000));

  // =======================
  // STEP 2: Generate Speech TTS
  // =======================
  const audio = await generateSpeech(script);
  console.log("Audio path:", audio);

  // =======================
  // STEP 3: Generate SUBTITLES
  // =======================
  const words = await transcribeAudio(audio);
  const subtitles = generateSRT(words);
  console.log("Subtitles path:", subtitles);

  // =======================
  // STEP 4: MULTI-SCENE CLIPS
  // =======================
  let clips = [];

  try {    
    const queries = await generateSceneQueries(script);
    console.log("Scene queries:", queries);

    for (const q of queries) {
      try {
        const clip = await fetchBackgroundVideo(q);

        if (clip) {
          console.log("Fetched clip for:", q, "->", clip);
          clips.push(clip);
        }
      } catch (err) {
        console.log("Failed for query:", q);
      }
    }

    if (clips.length === 0) {
      console.log("No clips found, using fallback...");
      const fallback = await fetchBackgroundVideo(topic);
      clips.push(fallback);
    }

  } catch (err) {
    console.log("Scene generation failed, using fallback...");
    // fallback → use topic
    const fallback = await fetchBackgroundVideo(topic);
    clips.push(fallback);
  }

  console.log("Final clips:", clips);

  // =======================
  // STEP 5: FINAL VIDEO
  // =======================
  const video = await generateMergedVideo(audio, subtitles, clips);

  console.log("Video path:", video);
  console.log("Pipeline complete.");
}

main().catch(console.error);

/*
✅ What you fixed (important)
✔ No duplicate logic
✔ No unused variables (bgVideo)
✔ Clean multi-clip pipeline
✔ Proper order of operations
✔ Future-proof structure
*/ 