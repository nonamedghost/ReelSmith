export async function generateVisualQuery(script) {
  const prompt = `
Convert this script into a short visual search query for stock footage.

Rules:
- Max 5 words
- Focus on what should be VISUALLY shown
- No abstract words
- Output ONLY the query

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

  // Safe extraction (same style as your script generator)
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "nature";

  return text.trim().replace(/["']/g, "");
}







// export async function generateVisualQuery(script) {
//   const prompt = `
// Convert this script into a short visual search query for stock footage.

// Rules:
// - Max 5 words
// - Focus on what should be VISUALLY shown
// - No abstract words
// - Output ONLY the query

// Script:
// "${script}"
// `;

//   const result = await model.generateContent(prompt);

//   return result.response.text().trim().replace(/["']/g, "");
// }