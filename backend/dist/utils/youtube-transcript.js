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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranscriptText = getTranscriptText;
const youtube_transcript_1 = require("youtube-transcript");
function getTranscriptText(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, lang = 'en') {
        try {
            youtube_transcript_1.YoutubeTranscript.fetchTranscript(url).then(console.log);
        }
        catch (err) {
            console.error('❌ Failed to fetch transcript:', err.message);
            return '';
        }
    });
}
