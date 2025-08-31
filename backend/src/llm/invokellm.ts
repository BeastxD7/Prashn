import Groq from "groq-sdk";

const groq = new Groq();

const default_model = "openai/gpt-oss-120b";

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
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "quiz_questions",
        schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["MCQ","SHORT_ANSWER","TRUE_FALSE","FILL_IN_THE_BLANK","MATCHING","ESSAY","ORDERING"] },
                  content: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  answer: { type: "string" },
                  explanation: { type: "string" },
                  difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] }
                },
                required: ["type", "content", "options", "answer", "explanation", "difficulty"],
                additionalProperties: false
              }
            }
          },
          required: ["questions"],
          additionalProperties: false
        }
      }
    }
  });

  return completion.choices[0]?.message?.content || "";
}
