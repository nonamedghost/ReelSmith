import "dotenv/config";
// Retry helper
async function fetchWithRetry(url, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      // Handle rate limits
      if (response.status === 429) {
        console.log(`Rate limited (${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      console.log(`Request failed: ${response.status}`);
    } catch (error) {
      console.log(`Fetch error: ${error.message}`);
    }
    // Wait before retrying (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Gemini request failed after retries');
}

export async function generateSceneQueries(script) {
  const prompt = `
Break this script into 3 REALISTIC stock footage search queries.

STRICT RULES:
- Each query must be 2-5 words
- Must describe a REAL visible scene
- Focus on:
  • people
  • actions
  • places
  • environments
  • moods
  • cinematic situations

AVOID:
- abstract concepts
- motivational words
- emotions alone
- philosophy
- comparisons
- metaphors

GOOD examples:
"man walking rainy street"
"woman using laptop cafe"
"busy traffic city night"
"waves crashing beach"
"dog running park"

BAD examples:
"success mindset"
"future of technology"
"power of discipline"
"dream big"
"feeling motivated"

IMPORTANT:
- Queries must work well on Pexels
- Make them visually searchable
- Return ONLY comma-separated queries
- No numbering
- No explanation

Script:
"${script}"
`;

  const response = await fetchWithRetry(
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

  // Safe extraction
  const rawText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Clean + dedupe
  let queries = [
    ...new Set(
      rawText
        .split(',')
        .map(q =>
          q
            .replace(/\n/g, '')
            .replace(/["']/g, '')
            .trim()
            .toLowerCase()
        )
        .filter(q => q.length > 0)
    ),
  ];

  // Limit to 3
  queries = queries.slice(0, 3);

  // fallback
  if (queries.length === 0) {
    console.log("⚠️ Empty scene queries, using defaults...");
    
    queries = [script.split(" ").slice(0, 3).join(" ")];
  }

  return queries;
}
