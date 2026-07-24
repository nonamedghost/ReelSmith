import { generateWithOpenRouter } from "../ai/providers/openrouter.js";

async function callJSON(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      let raw = await generateWithOpenRouter(prompt);

      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("No JSON object found");
      }

      const jsonText = cleaned.slice(start, end + 1);

      return JSON.parse(jsonText);
    } catch (err) {
      console.log("JSON parse failed:", attempt);

      if (attempt === retries) {
        throw err;
      }
    }
  }
}

// STEP 1
// VISUAL ANALYSIS

export async function analyzeScript(script) {
  return await callJSON(`
You are an elite filmmaker, visual storyteller and Veo prompt engineer.
Analyze this script FOR VISUALIZATION.
DO NOT summarize the script.

Determine:

1. What should be visible.
2. What subjects should appear.
3. What environments should appear.
4. What motion should occur.
5. What cinematic style best communicates the message.

Do NOT assume humans exist.
Return ONLY valid JSON:
{
  "core_message":"",
  "subjects":[],
  "visual_world":"",
  "mood":"",
  "cinematic_style":"",
  "camera_style":"",
  "lighting_style":""
}

SCRIPT:
${script}
`);
}

// STEP 2
// PROMPT GENERATION

export async function generatePrompts(script, analysis) {
  return await callJSON(`
You are a world-class Veo 3 prompt engineer.

SCRIPT:

${script}

VISUAL ANALYSIS:

${JSON.stringify({
  core_message: analysis.core_message,
  subjects: analysis.subjects,
  visual_world: analysis.visual_world,
  mood: analysis.mood,
  cinematic_style: analysis.cinematic_style,
  camera_style: analysis.camera_style,
  lighting_style: analysis.lighting_style,
}, null, 2)}

Create EXACTLY 3 cinematic AI video prompts.

Scene 1:
- setup
- establish context

Scene 2:
- development
- expand the visual idea

Scene 3:
- visual payoff
- strongest visual moment

For each prompt describe:

- Focus only on the most important visual elements.
- Keep prompts concise and cinematic.
- 35 to 60 words maximum.
- Use short, direct visual descriptions.
- Mention camera movement only if important.
- Prioritize subject and environment over extra details.

Rules:

- cinematic realism
- documentary realism
- natural motion
- realistic physics
- vertical 9:16

- describe only what the camera sees
- visual description only

- no narration
- no dialogue
- no subtitles
- no text overlays
- no explanations

- one paragraph per prompt
- maximum 60 words per prompt
- ideal length 40-50 words

Return ONLY JSON:

{
  "prompts":[
    "",
    "",
    ""
  ]
}
`);
}

// COMPLETE PIPELINE

export async function generateVideoPrompts(script) {
  console.log("Analyzing script...");

  const analysis = await analyzeScript(script);

  console.log("Generating prompts...");

  const result = await generatePrompts(
    script,
    analysis
  );

  // Debugging: Log the raw result
  console.log("RAW RESULT:");
  console.dir(result, { depth: null });

  const prompts = (result.prompts || [])
  .filter(p => typeof p === "string")
  .map(p => p.trim())
  .filter(p => p.length > 20);

  // console.log("RETURNING:", result.prompts); // Debugging: Log the prompts being returned

  return {
    analysis,
    prompts: [...new Set(prompts)].slice(0, 3),
  };
}