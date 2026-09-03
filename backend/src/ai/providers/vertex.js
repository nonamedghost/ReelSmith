import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// Vertex AI Client
const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
});

export async function generateWithVertex(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "";

    if (!text) {
      throw new Error("Empty Vertex response");
    }

    return text;
  } catch (error) {
    console.error("\n=== VERTEX AI ERROR ===");

    if (error?.status) {
      console.error("Status:", error.status);
    }

    if (error?.code) {
      console.error("Code:", error.code);
    }

    if (error?.message) {
      console.error("Message:", error.message);
    }

    // Print full error object for debugging
    console.error("Full Error:");
    console.error(JSON.stringify(error, null, 2));

    throw error;
  }
}