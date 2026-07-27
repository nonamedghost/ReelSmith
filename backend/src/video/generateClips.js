import { generateSceneQueries } from "../script/generateSceneQueries.js";
import { generateAiScenePrompts } from "../script/generateAiScenePrompts.js";
import { getVideoProvider } from "./vdo-providers/index.js";

export async function generateClips({ script, topic, provider, logInfo, logWarn }) {
  let clips = [];
  const videoProvider = getVideoProvider(provider);
  // testing
  // console.log({
  //   requestedProvider: provider,
  //   providerType: videoProvider.type,
  // });

  // return [];

  try {
    // STEP 1: Generate scenes based on provider type
    let scenes;

    if (videoProvider.type === "ai") {
      scenes = await generateAiScenePrompts(script);
      logInfo(`✅ Generated ${scenes.length} AI scene prompts`);

    } else {
      scenes = await generateSceneQueries(script);
      logInfo(`✅ Generated ${scenes.length} scene queries`);
    }

    // STEP 2: Generate / Fetch clips
    for (const scene of scenes) {
      try {
        const clip = await videoProvider.generate(scene);

        if (clip) {
          // Debug
          // console.log("Fetched clip for:",scene,"->",clip);
          clips.push(clip);
        }

      } catch (err) {
        console.log("Failed for scene:", scene, err.message);
        logWarn(`Failed fetching clip for scene: ${scene} - ${err.message}`);
      }
    }

    // STEP 3: Fallback if no clips
    if (clips.length === 0) {
      console.log("❌ No clips found, using fallback clip...");
      logWarn("❌ No clips found, using fallback clip");

      const fallback = await videoProvider.generate(topic);
      clips.push(fallback);
    }
  } catch (err) {
    // FULL FAILURE FALLBACK
    console.log("❌ Scene generation failed, using fallback...", err.message);
    logWarn(`Scene generation failed: ${err.message}`);

    const fallback = await videoProvider.generate(topic);
    clips.push(fallback);
  }

  logInfo(`✅ Downloaded ${clips.length} clips`);
  return clips;
}