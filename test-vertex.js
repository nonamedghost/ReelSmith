import { generateWithVertex } from "./src/ai/providers/vertex.js";

const result = await generateWithVertex(
  "Tell me 3 interesting facts about cats."
);

console.log("\n=== RESULT ===\n");
console.log(result);