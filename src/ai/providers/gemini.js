import "dotenv/config";

export async function generateWithGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

if (!response.ok) {
  const errorText = await response.text();

  console.log("Status:", response.status);
  console.log("Error Response:", errorText);

  throw new Error(`Gemini API failed: ${response.status}`);
}

  const data = await response.json();

  console.log(
    "Tokens:",
    data?.usageMetadata?.totalTokenCount || "unknown"
  );

  // Safe extraction
  if (!data.candidates || !data.candidates.length) {
    throw new Error("No response from Gemini");
  }

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  if (!text) {
    throw new Error("Empty Gemini response");
  }

  return text;
}