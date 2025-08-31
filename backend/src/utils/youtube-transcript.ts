import { YoutubeTranscript } from 'youtube-transcript';


export async function getTranscriptText(url:string, lang = 'en') {
  try {

    console.log(`Fetching transcript for YouTube URL: ${url}`);

    const transcript = await YoutubeTranscript.fetchTranscript(url, { lang });
    console.log(`Transcript fetched successfully: ${JSON.stringify(transcript)}`);

    // transcript is an array of { text, duration, offset, lang }
    const plainText = transcript.map(item => item.text).join(' ');
    console.log(`Transcript fetched successfully 2: ${plainText}`);

    return plainText;
  } catch (err:any) {
    console.error('❌ Failed to fetch transcript:', err.message);
    return '';
  }
}