import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateGroqCompletion(prompt) {
  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

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

      max_tokens: 1500,
      response_format: {
        type: "json_object",
      },
    });

    const text =
      completion.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("Empty Groq response");
    }

    return text;

  } catch (error) {
    console.error("Groq API Error:");
    console.error(error);

    throw error;
  }
}