import { runPipeline } from "../../pipeline/runPipeline.js";
import { createJob, emitProgress, emitCompleted, emitError, deleteJob } from "../jobManager.js";

export async function generateReel(req, res) {
  const { category, topic, scriptText, voice, provider, uploadToYoutube } = req.body;
  const userId = req.user.userId;

  // Create a new background job
  const jobId = createJob(userId);

  // Respond immediately
  res.status(202).json({
    success: true,
    jobId,
    message: "Generation started",
  });

  // Run pipeline in background
  (async () => {
    try {
      emitProgress(
        jobId,
        "queued",
        0,
        "Starting pipeline..."
      );

      await runPipeline({
        category,
        topic,
        scriptText,
        voice,
        provider,
        uploadToYoutube,
        jobId,
        userId,
      });

      emitCompleted(jobId);

      // Cleanup after 5 minutes
      setTimeout(() => {
        deleteJob(jobId);
      }, 5 * 60 * 1000);

    } catch (err) {
      emitError(jobId, err.message);

      setTimeout(() => {
        deleteJob(jobId);
      }, 5 * 60 * 1000);
    }
  })();
}