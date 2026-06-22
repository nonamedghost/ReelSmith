import { generateStoryboardPrompts } from "./aiStoryboardAgent.js";

const script = `
Imagine controlling computers with just your thoughts in the near future.
Brain-computer interfaces are becoming mainstream.
Digital consciousness could mean living forever.
Cities may repair themselves using organic technology.
Your future memories might not even be your own.
`;

async function run() {

  try {

    const result = await generateStoryboardPrompts(script);

    console.log("\n=== ANALYSIS ===\n");
    console.log(JSON.stringify(result.analysis, null, 2));

    console.log("\n=== STORYBOARD ===\n");
    console.log(JSON.stringify(result.storyboard, null, 2));

    console.log("\n=== PROMPTS ===\n");
    console.log(result.prompts);

  } catch (err) {

    console.error(err);

  }

}

run();