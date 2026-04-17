import 'dotenv/config';
import { ensureDirectories } from './utils/paths.js';
import { generateScript } from './script/index.js';
import { generateSpeech } from './tts/index.js';
import { generateVideo } from './video/index.js';

async function main() {
  await ensureDirectories();

  console.log('Reels Generator started.');

  // Step 1: Generate script
  // const script = await generateScript();
    const script = generateScript(); // ❗ no await here
    console.log("Script:", script);

  // Step 2: Generate speech from script
  // const audio = await generateSpeech(script);
  const audio = await generateSpeech(script);
  console.log("Audio path:", audio);

  // Step 3: Generate video with audio
  // const video = await generateVideo(audio);
  const video = await generateVideo(audio);
 console.log("Video path:", video);

  console.log('Pipeline complete.');
}

main().catch(console.error);

