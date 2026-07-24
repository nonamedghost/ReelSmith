// Scene query generator
// Uses OpenRouter for realistic stock footage queries
// Includes cleaning, validation, dedupe, logging, and fallback
import "dotenv/config";
import fs from "fs";
import { generateWithOpenRouter } from "../ai/providers/openrouter.js";

// MAIN FUNCTION
export async function generateSceneQueries(script) {
  const prompt = `
Break this script into 3 REALISTIC stock footage search queries.

STRICT RULES:
- Each query must be 2-5 words
- Must describe a REAL visible scene
- Focus on:
  - people
  - actions
  - places
  - environments
  - cinematic situations

AVOID:
- abstract concepts
- motivational words
- philosophy
- metaphors
- emotions alone

Avoid overused space facts like:
- Venus day longer than year
- Jupiter storm
- black holes
unless highly relevant.

GOOD examples:
"man walking rainy street"
"busy city traffic night"
"woman typing laptop"
"ocean waves crashing"
"dog running park"

BAD examples:
"success mindset"
"future technology"
"power of discipline"
"dream big"

IMPORTANT:
- Queries must work well on Pexels
- Make them visually searchable
- Return ONLY queries
- No explanation
- No numbering

Script:
"${script}"
`;

  try {
    console.log("Generating scene queries...");

    // OPENROUTER GENERATION
    const rawText = await generateWithOpenRouter(prompt);
    console.log("Raw scene output:", rawText);

    // RAW OUTPUT LOGGING
    fs.mkdirSync("output/logs", { recursive: true });
    
    fs.appendFileSync(
      "output/logs/scene-queries-raw.txt",
      `\n\n=== OPENROUTER ===\n${new Date().toISOString()}\n${rawText}\n`
    );

    // PARSE + CLEAN
    let queries = rawText
      .split(/\n|,/)
      .map(q =>
        q
          .replace(/^\d+[\).\s-]*/, "")
          .replace(/^[-*]\s*/, "")
          .replace(/["']/g, "")
          .trim()
          .toLowerCase()
      )
      .filter(q => q.length > 0);

    // VALIDATION
    queries = queries.filter(q => {
      const words = q.split(" ").length;

      return (
        words >= 2 &&
        words <= 6 &&
        !q.includes(":") &&
        !q.includes("example") &&
        !q.includes("query")
      );
    });

    // REMOVE DUPLICATES
    queries = [...new Set(queries)];

    // LIMIT TO 3
    queries = queries.slice(0, 3);

    // FALLBACK
    if (queries.length === 0) {
      console.log("No valid queries, using fallback...");

      queries = [
        "cinematic city street",
        "person walking outside",
        "nature landscape view",
      ];
    }
    console.log("Final scene queries:", queries);

    return queries;
  } catch (error) {
    console.log("Scene query generation failed.");
    console.error(error);

    return [
      "cinematic city street",
      "person walking outside",
      "nature landscape view",
    ];
  }
}