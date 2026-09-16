import { getJob, addListener, removeListener } from "../jobManager.js";

// Returns the job object
export function streamProgress(req, res) {
  const { jobId } = req.params;

  const job = getJob(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: "Job not found",
    });
  }

  // if job is not owned by user
  if (job.userId !== req.user.userId) {
    return res.status(403).json({
      success: false,
      error: "Access denied",
    });
  }

  // Required SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (res.flushHeaders) {
    res.flushHeaders();
  }

  // Register this client
  addListener(jobId, res);

  // Send current job state to newly connected client
  res.write(
    `data: ${JSON.stringify({
      type: "progress",
      jobId,
      step: job.step,
      status: job.status,
      progress: job.progress,
      message: job.status === "queued"
        ? "Waiting to start..."
        : "Reconnected to existing job",
    })}\n\n`
  );

  // Remove client on disconnect
  req.on("close", () => {
    removeListener(jobId, res);
    res.end();
  });
}