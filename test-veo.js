import veoProvider from "./src/video/vdo-providers/veoProvider.js";

await veoProvider.generate(
  "cozy japanese home dinner night",
  "./output/temp/test-provider.mp4"
);



/*
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({
  vertexai: true,
  project: "project-85ff445b-674b-4647-b23",
  location: "us-central1",
});

async function test() {
  try {
    console.log("🎬 Testing Veo access...");

    let operation = await ai.models.generateVideos({
      model: "veo-3.1-lite-generate-001",
      prompt: "cozy japanese home dinner night",
      config: {
        numberOfVideos: 1,
        generateAudio: false,
        aspectRatio: "9:16",
        durationSeconds: 4,
        resolution: "720p",
        personGeneration: "allow_all",
      },
    });

    console.log("✅ Veo request submitted!");
    console.log("⏳ Waiting for video generation...");

    while (!operation.done) {
      console.log("⌛ Still processing... checking again in 15 seconds");

      await new Promise((resolve) => setTimeout(resolve, 15000));

      // Refresh the operation status
      operation = await ai.operations.get({
        operation: operation,
      });
    }

    console.log("🎉 Generation complete!");

    if (
      operation.response &&
      operation.response.generatedVideos &&
      operation.response.generatedVideos.length > 0
    ) {
      const video = operation.response.generatedVideos[0];

      console.log("✅ VIDEO GENERATED");

      //console.log("Video object:");
      //console.dir(video, { depth: null });

      if (video.video?.videoBytes) {
        const buffer = Buffer.from(
          video.video.videoBytes,
          "base64"
        );

        fs.writeFileSync(
          "./veo-test.mp4",
          buffer
        );

        console.log("✅ Saved video as veo-test.mp4");
        console.log(`📦 Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
      }
    } else {
      console.log("❌ No video returned");
      console.dir(operation, { depth: null });
    }
  } catch (err) {
    console.error("❌ Veo failed:");
    console.error(err);
  }
}

test();
*/
