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

export async function generateVideo(audioPath, subtitlePath, bgVideoPath) {
  if (!audioPath || typeof audioPath !== 'string') {
    throw new Error('generateVideo requires a valid audio file path.');
  }

  if (!await fs.pathExists(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  if (!await fs.pathExists(bgVideoPath)) {
    throw new Error(`Background video not found: ${bgVideoPath}`);
  }

  if (!await fs.pathExists(BG_VIDEO)) {
    throw new Error(`Background video not found: ${BG_VIDEO}. Place a bg.mp4 file in the assets/ folder.`);
  }

  await fs.ensureDir(OUTPUT_DIR);

  const safeSubtitlePath = subtitlePath
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:");

  return new Promise((resolve, reject) => {
    ffmpeg()
      //.input(BG_VIDEO)
      .input(bgVideoPath)
      .inputOptions(['-stream_loop', '-1'])  // loop background to cover audio length
      .input(audioPath)
      .videoFilters([
        // Scale & crop to 1080x1920 vertical format
        'scale=1080:1920:force_original_aspect_ratio=increase',
        'crop=1080:1920',
      ])
      .outputOptions([
        // '-t', String(duration),                 // match audio duration
        '-t', '30',                                // ⬅️ ADD THIS (30 seconds video)  
        '-map', '0:v:0',                           // video from background
        '-map', '1:a:0',                           // audio from speech file
        '-c:v', 'libx264',                         // video codec
        '-c:a', 'aac',                             // audio codec
        '-shortest',                               // match shortest input
        '-vf', `subtitles='${safeSubtitlePath}'`,  // add subtitles
        //  "-fflags", "+shortest", // match shortest input
        '-y'                                       // overwrite output file if it exists 
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
