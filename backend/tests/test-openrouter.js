import { generateScript } from "../src/script/generateScriptAI.js";
import { generateAiScenePrompts } from "../src/script/generateAiScenePrompts.js";

const animeTopics = [
  "attack on titan secrets",
  "anime power systems",
  "dark anime theories",
  "one piece mysteries",
  "naruto hidden facts",
];

async function runTests() {
  for (const topic of animeTopics) {
    try {
      console.log("\n=================================");
      console.log(`TESTING: ${topic}`);
      console.log("=================================\n");

      const script = await generateScript(topic);

      console.log("\n=== SCRIPT ===\n");
      console.log(script);

      const prompts = await generateAiScenePrompts(script);

      console.log("\n=== PROMPTS ===\n");
      console.dir(prompts, { depth: null });
      // console.log("Prompt lengths:", prompts.prompts.map(p => p.length));

      console.log("\n✅ COMPLETE\n");
    } catch (err) {
      console.error(`❌ FAILED: ${topic}`);
      console.error(err);
    }
  }

  console.log("\n🏁 ALL TESTS FINISHED");
}

runTests();

