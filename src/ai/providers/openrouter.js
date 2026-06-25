import "dotenv/config";

export async function generateWithOpenRouter(prompt) {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },

        body: JSON.stringify({
          // model: "deepseek/deepseek-chat",
          model: process.env.OPENROUTER_MODEL,

          messages: [
            {
              role: "system",
              content:
                "You are a precise AI assistant that returns clean structured outputs.",
            },

            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.7,
          max_tokens: 1200,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter API failed: ${response.status}`);
    }

    const data = await response.json();

    const text =
      data?.choices?.[0]?.message?.content?.trim() || "";

    if (!text) {
      throw new Error("Empty OpenRouter response");
    }

    return text;
  } catch (error) {
    console.error("OpenRouter Error:");
    console.error(error);

    throw error;
  }
}