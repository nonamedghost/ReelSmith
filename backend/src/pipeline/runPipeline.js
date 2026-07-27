import "dotenv/config";
import cleanup from "../utils/cleanup.js";
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

// MAIN PIPELINE
export async function runPipeline({
    topic,
    provider,
    uploadToYoutube = true,
} = {}) {
    // delete these 5-6 lins after testing
    // console.log({
    //     topic,
    //     provider,
    //     uploadToYoutube,
    // });

    // return;

    cleanup();              // clean temp, clips, final
    logRunStart();          // log run start
    await ensureDirectories(); // recreate folders
    logInfo("Reels Generator started.");

    // STEP 1: SCRIPT
    // const topics = ["space facts", "animal facts", "science facts"];
    // const topic = topics[Math.floor(Math.random() * topics.length)];
    // const { category, topic } = getRandomTopic();
    let category;
    if (!topic) {
        ({ category, topic } = getRandomTopic());
    }
    const USE_AI = true;
    let script;

    try {
        script = USE_AI
            ? await generateScript(topic)
            : generateScriptDummy();
    } catch (err) {
        logError(`❌ AI script generation failed: ${err.message}`);
        console.log("❌ Gemini ERROR:", err);
        console.log("❌ AI Script failed, using fallback...");
        script = generateScriptDummy();
    }
    logInfo(`📂 Category selected: ${category}`);
    logInfo(`✅ Topic selected: ${topic}`);
    console.log("✅ Script:", script);
    logInfo("✅ Script generated successfully");

    // STEP 2: GENERATE METADATA
    const metadata = await generateMetadata(
        script,
        topic
    );
    logInfo(`✅ Metadata generated: ${metadata.title}`);

    // STEP 3: Generate Speech TTS
    const audio = await generateSpeech(script);
    console.log("Audio path:", audio);
    logInfo("✅ Voiceover(TTS) generated");

    // STEP 4: Generate SUBTITLES
    const words = await transcribeAudio(audio);
    const subtitles = generateSRT(words);
    console.log("Subtitles path:", subtitles);
    logInfo("✅ Subtitles generated");

    // STEP 5: MULTI-SCENE CLIPS
    const clips = await generateClips({
        script,
        topic,
        provider,
        logInfo,
        logWarn
    });

    // STEP 6: FINAL VIDEO
    logInfo("Final rendering started");
    const video = await generateMergedVideo(audio, subtitles, clips);
    console.log("Video path:", video);
    logInfo("✅ Final rendering completed");

    // STEP 7: VALIDATE OUTPUT
    const validation = validateOutput();

    if (!validation.success) {
        logError("❌ Output validation failed");
        for (const err of validation.errors) {
            console.error("-", err);
        }
        process.exit(1);
    }
    logInfo("✅ Output validation passed");

    // STEP 8: UPLOAD TO YOUTUBE
    if (uploadToYoutube) {
        try {
            const uploadResult = await uploadYoutubeVideo({
                videoPath: video,
                metadata,
            });

            logInfo(`✅ YouTube upload complete: ${uploadResult.id}`);
            logRunEnd(true);

        } catch (err) {
            logError(`❌ YouTube upload failed: ${err.message}`);
            logRunEnd(false);
            throw err;
        }

    } else {
        logInfo("⏭️ Skipping YouTube upload");
        logRunEnd(true);
    }

}

