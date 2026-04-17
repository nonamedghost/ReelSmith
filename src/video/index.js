import path from 'path';
import fs from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { OUTPUT_DIR, ASSETS_DIR } from '../utils/paths.js';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const BG_VIDEO = path.join(ASSETS_DIR, 'bg.mp4');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'video.mp4');

// function getAudioDuration(filePath) {
//   return new Promise((resolve, reject) => {
//     ffmpeg.ffprobe(filePath, (err, metadata) => {
//       if (err) return reject(new Error(`Failed to probe audio: ${err.message}`));
//       resolve(metadata.format.duration);
//     });
//   });
// }

export async function generateVideo(audioPath) {
  if (!audioPath || typeof audioPath !== 'string') {
    throw new Error('generateVideo requires a valid audio file path.');
  }

  if (!await fs.pathExists(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  if (!await fs.pathExists(BG_VIDEO)) {
    throw new Error(`Background video not found: ${BG_VIDEO}. Place a bg.mp4 file in the assets/ folder.`);
  }

  await fs.ensureDir(OUTPUT_DIR);

//   const rawDuration = await getAudioDuration(audioPath);
//   const duration = parseFloat(rawDuration);
//   if (isNaN(duration) || duration <= 0) {
//     throw new Error('Could not determine audio duration. Is the file a valid audio format?');
//   }
//   console.log(`Audio duration: ${duration.toFixed(2)}s`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(BG_VIDEO)
      .inputOptions(['-stream_loop', '-1'])  // loop background to cover audio length
      .input(audioPath)
      .videoFilters([
        // Scale & crop to 1080x1920 vertical format
        'scale=1080:1920:force_original_aspect_ratio=increase',
        'crop=1080:1920',
      ])
      .outputOptions([
        // '-t', String(duration),   // match audio duration
        // '-t', '30',   // ⬅️ ADD THIS (30 seconds video)
        '-map', '0:v:0',          // video from background
        '-map', '1:a:?',          // audio from speech file
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-shortest',
        "-fflags", "+shortest", // match shortest input
        '-y',                     // overwrite output
      ])
      .output(OUTPUT_FILE)
      .on('start', (cmd) => {
        console.log('FFmpeg started.');
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Encoding: ${progress.percent.toFixed(1)}%`);
        }
      })
      .on('end', () => {
        console.log(`Video created: ${OUTPUT_FILE}`);
        resolve(OUTPUT_FILE);
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .run();
  });
}
