import { generateWithGemini } from "../ai/providers/gemini.js";

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
Create a short, engaging YouTube Shorts script.

Topic: ${topic}

Rules:
- Max 2 to 3 sentences
- Hook in first line
- Simple conversational tone
- No emojis
- No formatting

Only return the script text.
`;

  const text = await fetchWithRetry(() =>
    generateWithGemini(prompt)
  );

  // Debug (TEMP — keep this for now)
  console.log("Gemini response received");

  return text.trim();
}