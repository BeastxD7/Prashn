export function fixJsonStructure(input: string): string | null {
  try {
    // Quick check if input is valid JSON
    JSON.parse(input);
    console.log('Input is valid JSON.\n');
    return input; // Already valid JSON
  } catch {
    // Attempt to fix common errors
    console.log('Input is invalid JSON, attempting to fix.\n');

    // 1. Remove backticks, markdown code fences, or other wrappers often added by LLMs
    let text: string = input.trim()
      .replace(/```json[\s\S]*?```/g, '') // Remove markdown code fences with json
      .replace(/```[\s\S]*?```/g, '')     // Remove generic markdown code fences
      .replace(/\n/g, ' ');               // optional: remove newlines for easier processing

    // 2. Replace trailing commas before } or ]
    text = text.replace(/,\s*([}\]])/g, '$1');

    // 3. Add commas between consecutive JSON objects without commas
    // (Very naive approach: add commas between }{ with no comma)
    text = text.replace(/}\s*{/g, '},{');

    // 4. Ensure valid wrapping array brackets if needed
    if (!text.startsWith('[') && !text.startsWith('{')) {
      text = '[' + text + ']';
    }

    // 5. Try parse again
    try {
      JSON.parse(text);
        console.log('Successfully fixed JSON.\n');
      return text;
    } catch (e) {
      console.error('Failed to fix JSON:', e);
      return null;
    }
  }
}
