import path from 'path';
import fs from 'fs-extra';
import { OUTPUT_DIR } from '../utils/paths.js';

const AUDIO_FILE = path.join(OUTPUT_DIR, 'audio.mp3');

export async function generateSpeech(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('generateSpeech requires a non-empty text string.');
  }

  await fs.ensureDir(OUTPUT_DIR);

  // Placeholder: write text content as a dummy audio file.
  // Replace this with a real TTS API call later.
  const placeholder = Buffer.from(`[TTS placeholder] ${text}`);
  await fs.writeFile(AUDIO_FILE, placeholder);

  console.log(`Audio file created: ${AUDIO_FILE}`);
  return AUDIO_FILE;
}
