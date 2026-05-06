import { exec } from "child_process";
import fs from "fs";
import path from "path";
import {PATHS, FINAL_DIR} from "../utils/paths.js";


const colors = [
  "&H00FFFF&", // yellow
  "&HFF00FF&", // pink
  "&H00FF00&", // green
  "&HFF0000&", // blue
  "&H00A5FF&", // orange-ish
  "&HFF00A5&", // purple-ish
];

function styleSentence(sentence) {
  const words = sentence.split(" ");

  const randomIndex = Math.floor(Math.random() * words.length);
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const styled = words.map((word, i) => {
    if (i === randomIndex) {
      return `{\\c${randomColor}}${word}{\\c&HFFFFFF&}`;
    }
    return word;
  });

  return styled.join(" ");
}


export async function generateSubtitles(audioPath) {
  const srtPath = path.join(FINAL_DIR, "audio.srt");

  await new Promise((resolve, reject) => {
    exec(
      `python -m whisper "${audioPath}" --model base --output_format srt --output_dir ${FINAL_DIR}`,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });

  return srtPath;
}

export function convertSrtToAss(srtPath) {
  const srt = fs.readFileSync(srtPath, "utf-8");

  const lines = srt.split("\n");
  let events = [];

  for (let i = 0; i < lines.length; i++) {

    console.log("LINE:", lines[i]); // 👈 ADD THIS

    if (lines[i].includes("-->")) {
      const [startRaw, endRaw] = lines[i].split("-->");
      const start = startRaw.trim();
      const end = endRaw.trim();

      // ✅ ADD HERE
        console.log("START:", start);
        console.log("END:", end);
      
    console.log("TEXT:", lines[i + 1]); // 👈 ADD THIS

    let text = "";
    let j = i + 1;

    while (lines[j] && lines[j].trim() !== "") {
      text += lines[j] + " ";
      j++;
    }

      const chunks = chunkText(text);

      chunks.forEach((chunk, index) => {
        events.push(
          `Dialogue: 0,${formatTime(start)},${formatTime(end)},Default,,0,0,0,,${styleSentence(chunk.toUpperCase())}`
        );
      });
    }
  }

  console.log("TOTAL EVENTS:", events.length);

  const ass = `
  [Script Info]
  Title: Shorts

  [V4+ Styles]
  Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
  Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,2,0,2,20,20,40,1

  [Events]
  Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
  ${events.join("\n")}
  `;

  const assPath = PATHS.subtitles;
  fs.writeFileSync(assPath, ass);

  return assPath;
}

function formatTime(time) {
  return time.trim().replace(",", ".");
}

function chunkText(text) {
  const words = text.split(" ");
  let result = [];

  for (let i = 0; i < words.length; i += 2) {
    result.push(words.slice(i, i + 2).join(" "));
  }

  return result;
}