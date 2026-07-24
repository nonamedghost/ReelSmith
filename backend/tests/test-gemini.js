// test-gemini.js

import { generateWithGemini } from "../src/ai/providers/gemini.js";

const result = await generateWithGemini(
  "Tell me 3 interesting facts about cats."
);

console.log(result);