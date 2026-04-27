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
import { generateVisualQuery } from "./script/generateVisualQuery.js";
import { generateSceneQueries } from "./script/generateSceneQueries.js";

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

  // function buildSearchQuery(topic, script) {
  //   const words = script.toLowerCase().split(/\W+/);

  //   const stopWords = [
  //     "the","is","and","a","to","of","in","it","you","your",
  //     "have","has","had","was","were","be","on","for","with",
  //     "this","that","they","them","their","can","also"
  //   ];

  //   const filtered = words.filter(
  //     w => w.length > 3 && !stopWords.includes(w)
  //   );

  //   // pick 2–3 meaningful words
  //   const selected = filtered
  //     .sort(() => 0.5 - Math.random())
  //     .slice(0, 3);

  //   return `${topic} ${selected.join(" ")}`;
  // }

  // Step 2.7: Fetch background video (SMART)
  // const query = buildSearchQuery(topic, script);
  // console.log("Search query:", query);

  // const bgVideo = await fetchBackgroundVideo(query);
  // console.log("Background video path:", bgVideo);
  
  
  // Step 2.7: Fetch background video (AI-powered)

  
  let visualQuery;

    try {
      visualQuery = await generateVisualQuery(script);
    } catch (err) {
      console.log("Visual query failed, using fallback...");
      visualQuery = topic; // fallback
    }
  console.log("Visual query:", visualQuery);

  // Step 2.8: Fetch background video
  const bgVideo = await fetchBackgroundVideo(visualQuery);
  console.log("Background video path:", bgVideo);
  

  /*
  // Step 2.7: Fetch background videos (MULTI-SCENE AI)

  let clips = [];

  try {
    const queries = await generateSceneQueries(script);
    console.log("Scene queries:", queries);

    for (const q of queries) {
      try {
        const clip = await fetchBackgroundVideo(q);
        console.log("Fetched clip for:", q, "->", clip);
        clips.push(clip);
      } catch (err) {
        console.log("Failed for query:", q);
      }
    }

  } catch (err) {
    console.log("Scene query failed, using fallback...");
    
    // fallback → use topic
    const fallbackClip = await fetchBackgroundVideo(topic);
    clips.push(fallbackClip);
  }
  */


  // Step 3: Generate video with audio (VIDEO)
  const video = await generateVideo(audio, subtitles, bgVideo);
  //const video = await generateVideo(audio, subtitles, clips);
  console.log("Video path:", video);

  console.log('Pipeline complete.');
}

main().catch(console.error);

