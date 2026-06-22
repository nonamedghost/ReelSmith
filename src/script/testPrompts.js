// aiStoryboardAgent.js
// Universal Script → Visual Analysis → Storyboard → Veo Prompts
import { generateWithOpenRouter } from "../ai/providers/openrouter.js";

// HELPERS
async function callJSON(prompt, retries = 3) {

  for (let attempt = 1; attempt <= retries; attempt++) {
      let raw = "";
    try {

      raw = await generateWithOpenRouter(prompt);

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
      
      console.log("RAW RESPONSE:");
      console.log(raw);
      console.log(
        `JSON parse failed (attempt ${attempt}/${retries})`
      );

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
You are an elite filmmaker, documentary director,
visual storyteller and Veo prompt engineer.

Analyze this script FOR VISUALIZATION.

Your task is NOT to summarize.

Your task is to determine:

1. What should be visible.
2. What subjects should appear.
3. What environments should appear.
4. What motion should occur.
5. What visual metaphors should be used.
6. What cinematic style best communicates the message.

The script may involve:

- humans
- animals
- nature
- space
- oceans
- technology
- psychology
- history
- science
- abstract concepts

Do NOT assume humans exist.

Return ONLY valid JSON.

{
  "core_message":"",
  "visualization_mode":"",
  "primary_subjects":[ { "name":"", "type":"" } ],
  "visual_world":"",
  "mood":"",
  "important_elements":[],
  "visual_events":[],
  "visual_metaphors":[],
  "cinematic_style":"",
  "lighting_style":"",
  "camera_style":"",
  "color_palette":"",
  "best_visual_approach":""
}

SCRIPT:

${script}
`);
}

// STEP 2
// STORYBOARD
export async function buildStoryboard(analysis) {

  return await callJSON(`
You are an elite cinematic storyboard artist.
Using this visual analysis:

${JSON.stringify(analysis, null, 2)}

Create EXACTLY 3 scenes.

Scene 1 = introduction
Scene 2 = exploration
Scene 3 = visual payoff

Each scene should represent a different visual moment.

Return ONLY valid JSON.
{
  "scenes":[
    {
      "scene":1,
      "purpose":"introduction",
      "focus":"",
      "focus_type":"",
      "environment":"",
      "motion":"",
      "atmosphere":"",
      "camera":"",
      "lighting":"",
      "description":""
    },

    {
      "scene":2,
      "purpose":"exploration",
      "focus":"",
      "focus_type":"",
      "environment":"",
      "motion":"",
      "atmosphere":"",
      "camera":"",
      "lighting":"",
      "description":""
    },

    {
      "scene":3,
      "purpose":"visual payoff",
      "focus":"",
      "focus_type":"",
      "environment":"",
      "motion":"",
      "atmosphere":"",
      "camera":"",
      "lighting":"",
      "description":""
    }
  ]
}
`);
}

// STEP 3
// VEO PROMPT GENERATION
export async function generateVeoPrompts(storyboard, analysis) {

  const prompts = [];

  for (const scene of storyboard.scenes) {

    const prompt = await generateWithOpenRouter(`
You are a world-class Veo 3 prompt engineer.

Convert this storyboard scene into
a cinematic AI video prompt.

SCENE:
${JSON.stringify(scene, null, 2)}

GLOBAL STYLE:
${JSON.stringify({
  cinematic_style: analysis.cinematic_style,
  lighting_style: analysis.lighting_style,
  camera_style: analysis.camera_style,
  color_palette: analysis.color_palette
}, null, 2)}

RULES:

- Visual description only
- No narration
- No dialogue
- No subtitles
- No text overlays
- No explanations

- Cinematic realism
- Documentary realism
- Realistic motion
- Natural movement

- Vertical 9:16
- One paragraph
- Maximum 120 words

Describe:

- main subject
- environment
- atmosphere
- motion
- lighting
- camera movement

Return ONLY the final prompt.
`);

    const cleaned = prompt.trim();

    if (cleaned.length > 20) {
      prompts.push(cleaned);
    }
  }

  return [...new Set(prompts)].slice(0, 3);
}

// COMPLETE PIPELINE
export async function generateStoryboardPrompts(script) {

  console.log("Analyzing script...");

  const analysis = await analyzeScript(script);

  console.log("Building storyboard...");

  const storyboard = await buildStoryboard(analysis);

  console.log("Generating Veo prompts...");

  const prompts = await generateVeoPrompts(storyboard, analysis);

  return {
    analysis,
    storyboard,
    prompts
  };
}