// generateAiScenePrompt.js

// AI scene prompt generator
// Used for Veo, Runway, Kling, Luma, etc.
// Reads the full script and creates 3 cinematic video prompts

import fs from "fs";
import { generateWithOpenRouter } from "../ai/providers/openrouter.js";

export async function generateAiScenePrompts(script) {
  const prompt = `
Break this script into 3 cinematic AI video scenes.

RULES:
- Return exactly 3 scene prompts
- Each prompt should describe a VISUAL scene
- Focus on what the camera sees
- Include:
  - subject
  - action
  - environment
  - lighting
  - camera movement
- Realistic cinematic style
- Documentary quality visuals
- Vertical 9:16 format
- Natural motion
- Avoid text overlays
- Avoid narration descriptions
- Avoid explanations

Good example:

A young scientist works alone in a futuristic laboratory, 
holographic screens glowing around him, blue ambient lighting, 
slow cinematic camera push-in, realistic motion, highly detailed, documentary style, vertical 9:16.

Script:

"${script}"

Return ONLY the 3 prompts.
One prompt per line.
`;

  try {
    console.log("Generating AI scene prompts...");

    // OPENROUTER GENERATION
    const rawText = await generateWithOpenRouter(prompt);
    // Debug
    // console.log("Raw AI scene output:", rawText);

    // save raw output in logs folder for debugging purposes
    fs.mkdirSync("output/logs", { recursive: true });
    
    const logEntry = [
      "",
      "",
      "=== OPENROUTER ===",
      `TIMESTAMP: ${new Date().toISOString()}`,
      "",
      "SCRIPT:",
      script,
      "",
      "GENERATED SCENES:",
      rawText,
      "",
    ].join("\n");

    // Debug
    fs.appendFileSync(
      "output/logs/ai-scene-prompts-raw.txt",
      logEntry
    );

    // PARSE + CLEAN
    let prompts = rawText
      .split(/\n/)
      .map(line =>
        line
          .replace(/^\d+[\.\)\-\s]*/, "")
          .replace(/^["']/, "")
          .replace(/["']$/, "")
          .trim()
      )
      .filter(p => p.length > 20);

    // remove duplicates
    prompts = [...new Set(prompts)];

    // keep only 3
    prompts = prompts.slice(0, 3);

    if (prompts.length === 0) {
      throw new Error("No valid AI prompts generated");
    }

    // Debug
    // console.log("Final AI prompts:", prompts);

    return prompts;

  } catch (error) {
    console.log("AI scene prompt generation failed");
    console.error(error);

    return [
      "A person walking through a modern city street, cinematic lighting, realistic motion, documentary style, vertical 9:16",
      "A close-up of a person thinking deeply, dramatic lighting, shallow depth of field, cinematic camera movement, vertical 9:16",
      "A wide landscape shot with natural motion, realistic environment, professional cinematography, vertical 9:16"
    ];
  }
}