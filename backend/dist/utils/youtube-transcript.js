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
exports.getTranscriptText = void 0;
const youtube_caption_extractor_1 = require("youtube-caption-extractor");
const getTranscriptText = (videoUrl_1, ...args_1) => __awaiter(void 0, [videoUrl_1, ...args_1], void 0, function* (videoUrl, lang = 'en') {
    var _a;
    try {
        let videoID;
        // Check for youtu.be short URL
        const shortUrlMatch = videoUrl.match(/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortUrlMatch) {
            videoID = shortUrlMatch[1];
        }
        else {
            // Fallback to standard URL
            videoID = (_a = videoUrl.split('v=')[1]) === null || _a === void 0 ? void 0 : _a.split('&')[0];
        }
        if (!videoID) {
            throw new Error('Invalid YouTube URL');
        }
        const subtitles = yield (0, youtube_caption_extractor_1.getSubtitles)({ videoID, lang });
        // Concatenate all 'text' values into a single string
        const transcriptText = subtitles.map(sub => sub.text).join(' ');
        // console.log(transcriptText);
        return transcriptText;
    }
    catch (error) {
        console.error('Error fetching subtitles:', error);
        return '';
    }
});
exports.getTranscriptText = getTranscriptText;
// const fetchVideoDetails = async (
//   videoID: string,
//   lang = 'en'
// ): Promise<VideoDetails> => {
//   try {
//     const details: VideoDetails = await getVideoDetails({ videoID, lang });
//     console.log(details);
//     return details;
//   } catch (error) {
//     console.error('Error fetching video details:', error);
//     throw error;
//   }
// };
// export async function getTranscriptText(url:string, lang = 'en') {
//   try {
//     console.log(`Fetching transcript for YouTube URL: ${url}`);
//     const transcript = await YoutubeTranscript.fetchTranscript(url, { lang });
//     console.log(`Transcript fetched successfully: ${JSON.stringify(transcript)}`);
//     // transcript is an array of { text, duration, offset, lang }
//     const plainText = transcript.map(item => item.text).join(' ');
//     console.log(`Transcript fetched successfully 2: ${plainText}`);
//     return plainText;
//   } catch (err:any) {
//     console.error('❌ Failed to fetch transcript:', err.message);
//     return '';
//   }
// }
