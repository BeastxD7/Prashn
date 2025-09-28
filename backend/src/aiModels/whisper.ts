import Groq from "groq-sdk";
import fs from "fs";
import os from "os";
import path from "path";

const groq = new Groq();


const default_model = "whisper-large-v3";

export async function transcribe(
  audioFileBuffer: Buffer,
  model: string = default_model,
  mimetype: string = "audio/wav",
  originalname: string = "audio.wav"
): Promise<string> {
  try {
    // Create a temporary file from the buffer
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, originalname);
    fs.writeFileSync(tempPath, audioFileBuffer);

    // Create a read stream from the temp file
    const stream = fs.createReadStream(tempPath);

    const transcription = await groq.audio.transcriptions.create({
      file: stream,
      model: model,
      response_format: "verbose_json",
    });

    // Clean up the temp file
    fs.unlinkSync(tempPath);

    // console.log(`Transcription: ${transcription.text}`);
    return transcription.text;
  } catch (error) {
    console.error("Error during transcription:", error);
    throw error;
  }
}
