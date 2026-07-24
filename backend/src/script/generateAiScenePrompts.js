// generateAiScenePrompt.js

// AI scene prompt generator
// Used for Veo, Runway, Kling, Luma, etc.
// Reads the full script and creates 3 cinematic video prompts
import fs from "fs";
import { generateVideoPrompts } from "./aiStoryboardAgent.js";

export async function generateAiScenePrompts(script) {

  try {
    console.log("Generating AI scene prompts...");

    // VIDEO PROMPTS PIPELINE
    const result = await generateVideoPrompts(script);

    const {
      analysis,
      prompts
    } = result;

    // console.log("RECEIVED:", prompts); // Debugging: Log the prompts being received

    // SAVE RAW OUTPUT IN LOGS FOLDER
    // FOR DEBUGGING PURPOSES
    fs.mkdirSync("output/logs", { recursive: true });

    const logEntry = [
      "",
      "===== AI SCENE PROMPTS =====",
      `MODEL: ${process.env.OPENROUTER_MODEL}`,
      `TIMESTAMP: ${new Date().toISOString()}`,
      "",
      "SCRIPT:",
      script,
      "",
      "ANALYSIS:",
      JSON.stringify(analysis, null, 2),
      "",
      "PROMPTS:",
      ...prompts,
      "",
      "============================"
    ].join("\n");

    fs.appendFileSync(
      "output/logs/ai-scene-prompts-raw.txt",
      logEntry
    );

    // Debug
    // console.log("Analysis:", analysis);
    // console.log("Storyboard:", storyboard);
    // console.log("Final AI prompts:", prompts);

    if (!prompts || prompts.length === 0) {
      throw new Error("No valid AI prompts generated");
    }
    return prompts;

  } catch (error) {
    console.log("AI scene prompt generation failed");
    console.error(error);

    return [
      "Wide cinematic establishing shot, realistic environment, documentary style, vertical 9:16",
      "Dynamic medium shot with realistic motion and cinematic lighting, vertical 9:16",
      "Dramatic close-up with emotional atmosphere and cinematic realism, vertical 9:16"
    ];
  }
}