import "dotenv/config";
import fs from "fs-extra";
import { GoogleGenAI } from "@google/genai";
// Vertex AI Client
// Uses ADC authentication: gcloud auth application-default login

const ai = new GoogleGenAI({
  vertexai: true,
  project: "project-85ff445b-674b-4647-b23",
  location: "us-central1",
});

export default {
  /**
   * Generate a Veo video and save it locally
   *
   * @param {string} prompt
   * @param {string} outputPath
   * @returns {Promise<string>}
   */
  async generate(prompt, outputPath) {
    try {
      console.log("🎬 Generating Veo clip...");
      console.log(`📝 Prompt: ${prompt}`);

      // STEP 1: Submit Veo generation request
      let operation = await ai.models.generateVideos({
        model: "veo-3.1-lite-generate-001",
        prompt,

        config: {
          numberOfVideos: 1,
          generateAudio: false,
          aspectRatio: "9:16",
          durationSeconds: 4,
          resolution: "720p",
          personGeneration: "allow_all",
        },
      });

      console.log("✅ Veo request submitted");
      console.log("⏳ Waiting for generation...");

      // STEP 2: Poll until finished
      while (!operation.done) {
        console.log("⌛ Still processing... checking again in 15 seconds");

        await new Promise((resolve) =>  setTimeout(resolve, 15000));

        // Refresh the operation status
        operation = await ai.operations.get({
          operation: operation,
        });
      }

      console.log("🎉 Generation complete");

      // STEP 3: Validate response
      if (
        !operation.response ||
        !operation.response.generatedVideos ||
        operation.response.generatedVideos.length === 0
      ) {
        throw new Error("❌ Veo completed but returned no videos.");
      }

      const video = operation.response.generatedVideos[0];

      if (!video.video?.videoBytes) {
        throw new Error("❌ Video returned but videoBytes missing.");
      }

      // STEP 4: Convert Base64 → MP4
      const buffer = Buffer.from(
        video.video.videoBytes,
        "base64"
      );

      // Ensure directory exists
      await fs.ensureDir(
        outputPath.substring(
          0,
          outputPath.lastIndexOf("/")
        )
      );

      await fs.writeFile(outputPath, buffer);

      console.log(`✅ Saved Veo clip`);
      console.log(`📁 ${outputPath}`);
      console.log(`📦 Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

      return outputPath;
    } catch (error) {
      console.error("❌ Veo generation failed");
      console.error(error);

      throw error;
    }
  },
};