"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribe = transcribe;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const groq = new groq_sdk_1.default();
const default_model = "whisper-large-v3";
function transcribe(audioFileBuffer_1) {
    return __awaiter(this, arguments, void 0, function* (audioFileBuffer, model = default_model, mimetype = "audio/wav", originalname = "audio.wav") {
        try {
            // Create a temporary file from the buffer
            const tempDir = os_1.default.tmpdir();
            const tempPath = path_1.default.join(tempDir, originalname);
            fs_1.default.writeFileSync(tempPath, audioFileBuffer);
            // Create a read stream from the temp file
            const stream = fs_1.default.createReadStream(tempPath);
            const transcription = yield groq.audio.transcriptions.create({
                file: stream,
                model: model,
                response_format: "verbose_json",
            });
            // Clean up the temp file
            fs_1.default.unlinkSync(tempPath);
            console.log(`Transcription: ${transcription.text}`);
            return transcription.text;
        }
        catch (error) {
            console.error("Error during transcription:", error);
            throw error;
        }
    });
}
