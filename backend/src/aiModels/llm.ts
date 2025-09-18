import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq();

const default_model = "meta-llama/llama-4-scout-17b-16e-instruct";

export async function callLLM(prompt: string, model: string = default_model): Promise<string> {
    if (prompt.trim().length > 100000) {
        throw new Error("Prompt exceeds maximum length of 100,000 characters.");
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: model,
            temperature: 0,
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Error invoking LLM:", error);
        throw new Error("Failed to invoke LLM");
    }
}
