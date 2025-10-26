import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

export const callLLM = async (text: string): Promise<string> => {
    const result = await generateText({
        model: groq('openai/gpt-oss-20b'),
        providerOptions: {
            apiKey: apiKey! as any,
        },
        prompt: text,
    });

    // Narrow unknown typing so we can safely access nested fields
    const r = result as any;
    const content = r?.steps?.[0]?.response?.body?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : String(content ?? '');
}

