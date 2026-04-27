export async function generateSceneQueries(script) {
  const prompt = `
    Break this script into 2-4 VISUAL scenes for stock footage search.

    Rules:
    - Each query = 2-4 words
    - Describe something you can SEE
    - NO comparisons (no "vs", no "than")
    - NO abstract ideas
    - Prefer real-world visuals

    Return ONLY comma-separated queries.

  Script:
  "${script}"
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );


  const data = await response.json();

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return text
    .split(",")
    .map(q => q.trim().toLowerCase())
    .filter(q => q.length > 0);
}
