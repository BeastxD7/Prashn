import Groq from "groq-sdk";

const groq = new Groq();

const default_model = "openai/gpt-oss-20b";

export async function invokeLLM(prompt: string, model:string = default_model): Promise<string> {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful quiz generation assistant.",
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
}
