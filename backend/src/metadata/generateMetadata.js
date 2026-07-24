// GROQ PROVIDER IMPORT
import { generateGroqCompletion } from "../ai/providers/groq.js";
// UTILS IMPORT & PATHS
import { saveJson } from "../utils/saveJson.js";
import { PATHS } from "../utils/paths.js";
// GENERATE METADATA
export async function generateMetadata(script, topic = "") {

  try {
    // AI PROMPT
    const prompt = `
        Generate YouTube Shorts metadata.

        Return ONLY valid JSON.

        Required format:

        {
        "title": "",
        "description": "",
        "hashtags": [],
        "tags": [],
        "filename": ""
        }

        Rules:
        - title under 60 characters
        - catchy and curiosity-driven
        - SEO friendly
        - description should be short
        - hashtags must start with #
        - tags should be searchable keywords
        - filename lowercase-with-dashes only
        - no markdown
        - no explanation text

        TOPIC:
        ${topic}

        SCRIPT:
        ${script}
        `;

    // GENERATE RESPONSE USING GROQ
    const text = await generateGroqCompletion(prompt);

    // CLEAN ACCIDENTAL MARKDOWN
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // PARSE JSON
    const metadata = JSON.parse(cleanedText);

    // VALIDATION
    if (!metadata.title) {
      throw new Error("Missing title");
    }
    if (!metadata.description) {
      throw new Error("Missing description");
    }
    if (!Array.isArray(metadata.hashtags)) {
      throw new Error("Invalid hashtags");
    }
    if (!Array.isArray(metadata.tags)) {
      throw new Error("Invalid tags");
    }

    // GENERATE FALLBACK FILENAME
    if (!metadata.filename) {
      metadata.filename = metadata.title
        .toLowerCase()
        // remove special characters
        .replace(/[^a-z0-9\s-]/g, "")
        // replace spaces with dashes
        .replace(/\s+/g, "-");
    }

    // SAVE METADATA TO FILE
    saveJson(PATHS.metadata, metadata);
    console.log("Metadata saved.");

    // RETURN CLEAN METADATA
    return metadata;
  }

  // ERROR HANDLING
  catch (error) {
    console.error("Metadata generation failed:");
    console.error(error);
    throw error;
  }
}