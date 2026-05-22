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
import validateOutput from "./utils/validateOutput.js";

import {logInfo, logError, logWarn} from "./utils/logger.js";

// MAIN PIPELINE
async function main() {
  cleanup();              // clean temp, clips, final
  
  await ensureDirectories(); // recreate folders
  console.log("Reels Generator started.");
  logInfo("Reels Generator started.");

  // STEP 1: SCRIPT
  const topics = ["space facts", "animal facts", "science facts"];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const USE_AI = true;

  let script;

  try {
    script = USE_AI
      ? await generateScript(topic)
      : generateScriptDummy();
  } catch (err) {
    logError(`AI script generation failed: ${err.message}`);
    console.log("Gemini ERROR:", err);
    console.log("AI failed, using fallback...");
    script = generateScriptDummy();
  }
  console.log("Topic:", topic);
  console.log("Script:", script);
  logInfo(`Topic selected: ${topic}`);
  logInfo("Script generated successfully");

  // STEP X: GENERATE METADATA
  const metadata = await generateMetadata(
    script,
    topic
  );
  console.log("Metadata:", metadata);
  logInfo(`Metadata generated: ${metadata.title}`);

  // Add delay here
  // await new Promise(resolve => setTimeout(resolve, 3000));

  // STEP 2: Generate Speech TTS
  const audio = await generateSpeech(script);
  console.log("Audio path:", audio);
  logInfo("Voiceover generated");

  // STEP 3: Generate SUBTITLES
  const words = await transcribeAudio(audio);
  const subtitles = generateSRT(words);
  console.log("Subtitles path:", subtitles);
  logInfo("Subtitles generated");

  // STEP 4: MULTI-SCENE CLIPS
  let clips = [];

  try {    
    const queries = await generateSceneQueries(script); // openrouter
    logInfo(`Generated ${queries.length} scene queries`);

    for (const q of queries) {
      try {
        const clip = await fetchBackgroundVideo(q);

        if (clip) {
          console.log("Fetched clip for:", q, "->", clip);
          clips.push(clip);
        }
      } catch (err) {
        console.log("Failed for query:", q);
        logWarn(`Failed fetching clip for query: ${q}`);
      }
    }

    if (clips.length === 0) {
      console.log("No clips found, using fallback...");
      logWarn("No clips found, using fallback clip");
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

  // STEP 5: FINAL VIDEO
  logInfo("Final rendering started");
  const video = await generateMergedVideo(audio, subtitles, clips);
  console.log("Video path:", video);
  logInfo("Final rendering completed");

  // STEP 6: VALIDATE OUTPUT
  const validation = validateOutput();

  if (!validation.success) {
    console.error("❌ Validation failed:");
    logError("Output validation failed");
    for (const err of validation.errors) {
      console.error("-", err);
    }
    process.exit(1);
  }
  console.log("✅ Output validation passed");
  logInfo("Output validation passed");
  console.log("Pipeline complete.");
  logInfo("Pipeline completed successfully");
}

main().catch(console.error);
