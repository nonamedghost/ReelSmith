import "dotenv/config";
import cleanup, { cleanupLibrary } from "../utils/cleanup.js";
import { ensureDirectories } from "../utils/paths.js";
import { generateScript } from "../script/generateScriptAI.js";
import { generateScriptDummy } from "../script/index.js";
import { generateSpeech } from "../tts/deepgramTTS.js";
import { transcribeAudio } from "../subtitles/deepgramSTT.js";
import { generateSRT } from "../subtitles/generateSRT.js";
import { generateClips } from "../video/generateClips.js";
import { generateMergedVideo } from "../video/multiclipVideo.js";
import { generateMetadata } from "../metadata/generateMetadata.js";
import validateOutput from "../utils/validateOutput.js";
import { logInfo, logError, logWarn, logRunStart, logRunEnd } from "../utils/logger.js";
import { uploadYoutubeVideo } from "../youtube/uploadYoutube.js";
import { getRandomTopic } from "../data/categories.js";
import { archiveGeneration, createYoutubeInfo } from "../utils/archiveGeneration.js";
import { createThumbnail } from "../video/utils/createThumbnail.js";
import { emitProgress, emitLog } from "../api/jobManager.js";

// MAIN PIPELINE
export async function runPipeline({
  category,
  topic,
  scriptText,
  voice = "aura-2-thalia-en",
  provider = "veo",
  uploadToYoutube = true,
  jobId,
  userId,
} = {}) {

  const pipelineLog = (message, level = "info") => {
    switch (level) {
      case "error": logError(message); break;
      case "warn": logWarn(message); break;
      case "info": logInfo(message); break;
      default: logInfo(message);
    }

    if (jobId) { emitLog(jobId, message, level); }
  };

  cleanup();              // clean temp, clips, final
  logRunStart();          // log run start
  await ensureDirectories(); // recreate folders
  pipelineLog("Reels Generator started.");

  // STEP 1: SCRIPT
  if (!topic) {
    const randomTopic = getRandomTopic();
    topic = randomTopic.topic;

    if (!category) {
      category = randomTopic.category;
    }
  }
  let script;
  if (scriptText && scriptText.trim()) {
    // Use the script provided by the frontend
    script = scriptText.trim();

    pipelineLog("📝 Using custom script provided by user");
  } else {
    // Generate script with AI
    try {
      script = await generateScript(topic);
    } catch (err) {
      pipelineLog(`❌ AI script generation failed: ${err.message}`, "error");
      console.log("❌ Gemini ERROR:", err);
      console.log("❌ AI Script failed, using fallback...");
      script = generateScriptDummy();
    }
    pipelineLog("🤖 AI script generated successfully");
  }
  pipelineLog(`📂 Category selected: ${category}`);
  pipelineLog(`✅ Topic selected: ${topic}`);
  console.log("✅ Script:", script);
  pipelineLog("✅ Script generated successfully");

  // update job at 10%
  emitProgress(jobId, "script", 10, "Script generated");

  // STEP 2: GENERATE METADATA
  const metadata = await generateMetadata(
    script,
    topic
  );
  pipelineLog(`✅ Metadata generated: ${metadata.title}`);

  // update job at 20%
  emitProgress(jobId, "metadata", 20, "Metadata generated");

  // STEP 3: Generate Speech TTS
  const { filePath: audio } = await generateSpeech(script, voice);
  console.log("Audio path:", audio);
  console.log("Voice:", voice);
  pipelineLog("✅ Voiceover(TTS) generated");

  // update job at 35%
  emitProgress(jobId, "tts", 35, "Voice generated");

  // STEP 4: Generate SUBTITLES
  const words = await transcribeAudio(audio);
  const subtitles = generateSRT(words);
  console.log("Subtitles path:", subtitles);
  pipelineLog("✅ Subtitles generated");

  // update job at 50%
  emitProgress(jobId, "subtitles", 50, "Subtitles generated");

  // STEP 5: MULTI-SCENE CLIPS
  const clips = await generateClips({
    script,
    topic,
    provider,
    logInfo,
    logWarn
  });

  // update job at 70%
  emitProgress(jobId, "clips", 70, "Video clips generated");

  // STEP 6: FINAL VIDEO
  pipelineLog("🎬 Final rendering started");
  const { videoPath: video, duration } = await generateMergedVideo(audio, subtitles, clips);
  console.log("Video path:", video);
  console.log("Duration:", duration);
  pipelineLog("✅ Final rendering completed");

  // update job at 85%
  emitProgress(jobId, "merge", 85, "Final video rendered");

  // STEP 6.5: GENERATE THUMBNAIL
  const thumbnail = await createThumbnail(video);

  console.log("Thumbnail path:", thumbnail);
  pipelineLog("🖼 Thumbnail generated");

  // update job at 90% (just before validation)
  emitProgress(jobId, "thumbnail", 90, "Thumbnail generated");

  // STEP 7: VALIDATE OUTPUT
  const validation = validateOutput();

  if (!validation.success) {
    pipelineLog("❌ Output validation failed", "error");
    for (const err of validation.errors) {
      console.error("-", err);
    }
    // process.exit(1); 
    // changed because it might be triggered in non-interactive envs (eg. frontend). so instead of exiting, we throw error.
    throw new Error("Output validation failed");
  }
  pipelineLog("✅ Output validation passed");

  // update job at 95% (just before upload)
  emitProgress(jobId, "validate", 95, "Output validated");

  let uploadResult = null;
  let uploadError = null;
  // STEP 8: UPLOAD TO YOUTUBE (optional)
  if (uploadToYoutube) {
    try {
      uploadResult = await uploadYoutubeVideo({
        videoPath: video,
        metadata,
      });

      pipelineLog(`✅ YouTube upload complete: ${uploadResult.id}`);
      logRunEnd(true);

    } catch (err) {
      uploadError = err;
      pipelineLog(`❌ YouTube upload failed: ${err.message}`, "error");
      logRunEnd(false);
      // throw err;
    }

  } else {
    pipelineLog("⏭️ Skipping YouTube upload");
    logRunEnd(true);
  }

  // STEP 9 : ARCHIVE GENERATION ⭐
  // create youtube info
  const youtubeInfo = createYoutubeInfo({
    requested: uploadToYoutube,
    uploadResult,
    error: uploadError,
  });
  // archive generation
  await archiveGeneration({
    topic,
    category,
    provider,
    duration,
    script,
    metadata,
    voice,
    userId,
    youtube: youtubeInfo,
  });

  // update job at 98% (just before cleanup)
  emitProgress(jobId, "archive", 98, "Generation archived");

  // Archive Library cleanup (keep only latest N reels)
  cleanupLibrary(Number(process.env.MAX_LIBRARY_REELS) || 10);

  // throw upload error if exists (continue pipeline even if upload fails)
  if (uploadError) {
    throw uploadError;
  }

}
