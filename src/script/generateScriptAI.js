import "dotenv/config";

// ✅ Retry helper
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);

    if (res.ok) return res;

    console.log(`Retry ${i + 1}...`);
    await new Promise(r => setTimeout(r, 2000));
  }

  throw new Error("Gemini failed after retries");
}

export async function generateScript(topic) {
  const response = await fetchWithRetry(
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
                    Create a short, engaging YouTube Shorts script.

                    Topic: ${topic}

                    Rules:
                    - Max 2 to 3 sentences
                    - Hook in first line
                    - Simple conversational tone
                    - No emojis
                    - No formatting

                    Only return the script text.
                                    `,
              },
            ],
          },
        ],
      }),
    }
  );

    const data = await response.json();

    // Debug (TEMP — keep this for now)
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    // Safe extraction
    if (!data.candidates || !data.candidates.length) {
    throw new Error("No response from Gemini");
    }

    const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Fallback script";

    return text.trim();
}




// import "dotenv/config";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function generateScript(topic) {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

//   const prompt = `
// Create a short, engaging YouTube Shorts script.

// Topic: ${topic}

// Rules:
// - Max 2 to 3 sentences
// - Hook in first line
// - Simple, conversational tone
// - No emojis
// - No formatting

// Only return the script text.
// `;

//   const result = await model.generateContent(prompt);
//   const text = result.response.text();

//   return text.trim();
// }