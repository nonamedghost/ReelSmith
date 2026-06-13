import { generateWithGemini } from "../ai/providers/gemini.js";
import { generateWithVertex } from "../ai/providers/vertex.js";

// Retry helper
async function fetchWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();

    } catch (err) {
      console.log(`Retry ${i + 1}...`);
      console.log(err.message);

      await new Promise((r) =>
        setTimeout(r, 2000)
      );
    }
  }

  throw new Error("Gemini failed after retries");
}

export async function generateScript(topic) {

const prompt = `
  Create a highly engaging YouTube Shorts script.

  Topic: ${topic}

  Requirements:
  - Around 40 to 70 words
  - Designed for 15 to 30 second narration
  - Strong hook in first sentence
  - Maintain curiosity throughout
  - Simple conversational tone
  - Easy to understand
  - No emojis
  - No markdown
  - No bullet points
  - Avoid repetitive phrasing
  - Make the narration feel natural and human
  - Each sentence should create a visual opportunity
  - No labels like "Hook:" or "Narrator:"
  - Keep pacing fast and engaging
  - End with a surprising payoff.

  Only return the final script text.
`;

  const text = await fetchWithRetry(() =>
    //generateWithGemini(prompt)
    generateWithVertex(prompt)
  );

  // Debug (TEMP — keep this for now)
  console.log("Vertex AI response received");

  return text.trim();
}