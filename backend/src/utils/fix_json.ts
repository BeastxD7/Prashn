export function fixJsonStructure(input: string): string | null {
  try {
    // Quick check if input is valid JSON
    JSON.parse(input);
    console.log('Input is valid JSON.\n');
    return input; // Already valid JSON
  } catch {
    // Attempt to fix common errors
    console.log('Input is invalid JSON, attempting to fix.\n');

    let text = input.trim();

    // 1. Extract JSON from markdown code fences if present
    const codeFenceMatch = text.match(/```json([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
    if (codeFenceMatch && codeFenceMatch[1]) {
      text = codeFenceMatch[1].trim();
    }

    // 2. Remove newlines for easier processing
    text = text.replace(/\n/g, ' ');

    // 3. Replace trailing commas before } or ]
    text = text.replace(/,\s*([}\]])/g, '$1');

    // 4. Add commas between consecutive JSON objects without commas
    text = text.replace(/}\s*{/g, '},{');

    // 5. Ensure valid wrapping array brackets if needed
    if (!text.startsWith('[') && !text.startsWith('{') && text.length > 0) {
      text = '[' + text + ']';
    }

    // 6. Try parse again
    try {
      JSON.parse(text);
      console.log('Successfully fixed JSON.\n');
      console.log(text);
      return text;
    } catch (e) {
      console.error('Failed to fix JSON:', e);
      return null;
    }
  }
}
