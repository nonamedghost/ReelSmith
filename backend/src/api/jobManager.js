import crypto from "crypto";

// Stores all active jobs in memory
const jobs = new Map();

// Creates a new job and returns a unique jobId
export function createJob() {
  const jobId = crypto.randomUUID();

  jobs.set(jobId, {
    id: jobId,
    listeners: new Set(),
    status: "queued",
    progress: 0,
    step: "queued",
  });

  return jobId;
}

// Returns the job object for a given jobId
export function getJob(jobId) {
  return jobs.get(jobId);
}

// Registers an SSE client to receive updates.
export function addListener(jobId, res) {
  const job = jobs.get(jobId);

  if (!job) return false;

  job.listeners.add(res);
  return true;
}

// Removes the client when it disconnects.
export function removeListener(jobId, res) {
  const job = jobs.get(jobId);

  if (!job) return;

  job.listeners.delete(res);
}

/**
 * Send an event to every listener
 */
function broadcast(job, payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;

  for (const client of job.listeners) {
    client.write(data);
  }
}

// Pipeline progress, updates the job state and broadcasts a progress event.
export function emitProgress(jobId, step, progress, message) {
  const job = jobs.get(jobId);

  if (!job) return;

  job.step = step;
  job.progress = progress;
  job.status = "running";

  broadcast(job, {
    type: "progress",
    jobId,
    step,
    progress,
    status: "running",
    message,
  });
}

// Terminal log, broadcasts log events separately.
export function emitLog(jobId, message, level = "info") {
  const job = jobs.get(jobId);

  if (!job) return;

  broadcast(job, {
    type: "log",
    jobId,
    level,
    message,
  });
}

// Pipeline completed, updates the final state before broadcasting.
export function emitCompleted(jobId, data = {}) {
  const job = jobs.get(jobId);

  if (!job) return;

  job.status = "completed";
  job.progress = 100;
  job.step = "completed";

  broadcast(job, {
    type: "completed",
    jobId,
    status: "completed",
    progress: 100,
    ...data,
  });
}

// Pipeline failed, upd ates the final state before broadcasting.
export function emitError(jobId, error) {
  const job = jobs.get(jobId);

  if (!job) return;

  job.status = "failed";
  job.step = "error";

  broadcast(job, {
    type: "error",
    jobId,
    status: "failed",
    message: error,
  });
}

// Removes the job from memory when it's no longer needed.
export function deleteJob(jobId) {
  jobs.delete(jobId);
}



/*

// Creates a new job and returns a unique jobId
export function createJob() {
  const jobId = crypto.randomUUID();

  jobs.set(jobId, {
    id: jobId,
    status: "queued",
    progress: 0,
    message: "Waiting to start...",
    listeners: new Set(),
    result: null,
    error: null,
  });

  return jobId;
}

// Updates the job and broadcasts the new state to all connected clients.
export function updateJob(jobId, update) {
  const job = jobs.get(jobId);
  if (!job) return;

  Object.assign(job, update);

  const payload = JSON.stringify({
    jobId,
    status: job.status,
    progress: job.progress,
    message: job.message,
    result: job.result,
    error: job.error,
  });

  for (const client of job.listeners) {
    client.write(`data: ${payload}\n\n`);
  }
}

*/