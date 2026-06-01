import { generateSceneQueries } from "../script/generateSceneQueries.js";
import { fetchBackgroundVideo } from "./fetchBackground.js";
import { getVideoProvider } from "./vdo-providers/index.js";

export async function generateClips({ script, topic, logInfo, logWarn }) {
  let clips = [];
  const provider = getVideoProvider();

  try {
    // STEP 1: Generate scene queries
    const queries = await generateSceneQueries(script); // openrouter

    logInfo(`✅ Generated ${queries.length} scene queries`);

    // STEP 2: Fetch clips
    for (const q of queries) {
      try {
        // const clip = await fetchBackgroundVideo(q);
        const clip = await provider.generate(q);

        if (clip) {
          console.log("Fetched clip for:", q, "->", clip);
          clips.push(clip);
        }

      } catch (err) {
        console.log("Failed for query:", q, err.message);
        logWarn(`Failed fetching clip for query: ${q} - ${err.message}`);
      }
    }

    // STEP 3: Fallback if no clips
    if (clips.length === 0) {
      console.log("❌ No clips found, using fallback clip...");
      logWarn("❌ No clips found, using fallback clip");

      // const fallback = await fetchBackgroundVideo(topic);
      const fallback = await provider.generate(topic);

      clips.push(fallback);
    }

  } catch (err) {
    // FULL FAILURE FALLBACK
    console.log("❌ Scene generation failed, using fallback...", err.message);
    logWarn(`Scene generation failed: ${err.message}`);

    //const fallback = await fetchBackgroundVideo(topic);
    const fallback = await provider.generate(topic)

    clips.push(fallback);
  }
  // console.log("Final clips:", clips);
  logInfo(`✅ Downloaded ${clips.length} clips`);

  return clips;
}