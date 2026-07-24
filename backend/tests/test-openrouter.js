import { generateScript } from "../src/script/generateScriptAi.js";
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

/*
import { generateScript } from "./src/script/generateScriptAi.js";
import { generateAiScenePrompts } from "./src/script/generateAiScenePrompts.js";

async function test() {
  try {
    // OPTION 1: Generate script automatically
    const script = await generateScript("attack on titan secrets");

    console.log("\n=== SCRIPT ===\n");
    console.log(script);

    const prompts = await generateAiScenePrompts(script);

    console.log("\n=== PROMPTS ===\n");
    console.dir(prompts, { depth: null });

  } catch (err) {
    console.error(err);
  }
}

test();
*/

/*
import { generateAiScenePrompts } from "./src/script/generateAiScenePrompts.js";

const script = `
The Titans were never humanity's greatest enemy.
For over a century, people believed the walls protected them from monsters.
But the truth was hidden inside the walls themselves.
The Titans were once human, transformed by a mysterious power.
`;

async function test() {
  const prompts = await generateAiScenePrompts(script);

  console.log("\n=== PROMPTS ===\n");
  console.dir(prompts, { depth: null });
}

test();
*/