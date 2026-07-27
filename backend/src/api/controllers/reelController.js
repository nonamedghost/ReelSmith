import { runPipeline } from "../../pipeline/runPipeline.js";

export async function generateReel(req, res) {
  try {
    const { topic, provider, uploadToYoutube } = req.body;

    await runPipeline({
      topic,
      provider,
      uploadToYoutube,
    });

    res.json({
      success: true,
      message: "Reel generated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}