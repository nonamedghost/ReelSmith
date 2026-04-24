import fs from "fs";

export async function transcribeAudio(audioPath) {
  const audioBuffer = fs.readFileSync(audioPath);

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/mpeg",
      },
      body: audioBuffer,
    }
  );

  if (!response.ok) {
    throw new Error("Deepgram STT failed");
  }

  const data = await response.json();

  const words =
    data.results.channels[0].alternatives[0].words;

  return words;
}