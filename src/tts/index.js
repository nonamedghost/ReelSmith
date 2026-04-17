


import fs from "fs";
import path from "path";
import axios from "axios";
import { OUTPUT_DIR } from "../utils/paths.js";

// 👇 ADD THIS HERE
function splitText(text, maxLength = 180) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];

  let current = "";

  for (let sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }

  if (current) chunks.push(current);

  return chunks;
}


// 👇 YOUR MAIN FUNCTION (REPLACE OLD ONE)
export async function generateSpeech(text) {
  const filePath = path.join(OUTPUT_DIR, "audio.mp3");

  const chunks = splitText(text); // 👈 uses helper

  const writer = fs.createWriteStream(filePath);

  for (let chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      chunk
    )}&tl=en&client=tw-ob`;

    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    await new Promise((resolve, reject) => {
      response.data.pipe(writer, { end: false });
      response.data.on("end", resolve);
      response.data.on("error", reject);
    });
  }

  writer.end();

  console.log(`Improved TTS audio created: ${filePath}`);
  return filePath;
}


/*
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { OUTPUT_DIR } from '../utils/paths.js';

const VOICE_ID = 'LWFgMHXb8m0uANBUpzlq';

export async function generateSpeech(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('generateSpeech requires a valid text.');
  }

  const filePath = path.join(OUTPUT_DIR, 'audio.mp3');

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

  console.log("KEY EXISTS:", !!process.env.ELEVENLABS_API_KEY);
  console.log("KEY LENGTH:", process.env.ELEVENLABS_API_KEY?.length);

    console.log("API KEY:", process.env.ELEVENLABS_API_KEY);

  const response = await axios({
    method: 'POST',
    url,
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    data: {
      text,
      model_id: 'eleven_multilingual_v2',
    },
    responseType: 'arraybuffer',
  });

  await fs.promises.writeFile(filePath, response.data);

  console.log(`Real TTS audio created: ${filePath}`);


  return filePath;
}

*/






/*
import path from 'path';
import fs from 'fs-extra';
import { OUTPUT_DIR, ASSETS_DIR } from '../utils/paths.js';

// const AUDIO_FILE = path.join(OUTPUT_DIR, 'audio.ogg'); ❌ not needed now

export async function generateSpeech(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('generateSpeech requires a non-empty text string.');
  }

 // await fs.ensureDir(OUTPUT_DIR); ❌ not needed now

   // ❌ OLD DUMMY LOGIC (keep commented)

  // Placeholder: write text content as a dummy audio file.
  // Replace this with a real TTS API call later.
  
  const placeholder = Buffer.from(`[TTS placeholder] ${text}`);
  await fs.writeFile(AUDIO_FILE, placeholder);

  console.log(`Audio file created: ${AUDIO_FILE}`);
  return AUDIO_FILE;
  


   // ✅ NEW: use real audio file
  const audioPath = path.join(ASSETS_DIR, 'audio.ogg');
  console.log(`Using dummy audio: ${audioPath}`);

  return audioPath;

}
*/