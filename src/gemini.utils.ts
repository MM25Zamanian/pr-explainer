import { GoogleGenAI, Type } from "@google/genai";

export async function getPrompt(input: unknown) {
  const prompt = await Bun.file("./.prompt").text();

  return prompt.replace("<<CHANGES>>", JSON.stringify(input));
}

export async function getAIResult(gemini: GoogleGenAI, prompt: string) {
  const response = await gemini.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      temperature: 1.3,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: {
            type: Type.STRING,
            description:
              `Provide a complete and technically detailed Markdown-formatted explanation of what has changed in this pull request. The explanation must analyze the full patch content of each file and summarize meaningful code-level or structural modifications. Focus on functionality, logic, models, workflows, or configuration changes. Use professional technical language with clear structure (e.g., paragraphs or bullet points).`.trim(),
          },
          title: {
            type: Type.STRING,
            description:
              `Write a one-line title using the Conventional Commits standard. Format: <type>(scope): short description. The 'scope' is required and must accurately reflect the main area affected by the PR (e.g., schema, api, ui, workflow, auth, infra). Use one of: feat, fix, chore, docs, refactor, test, ci, build. Be precise, clear, and concise.`.trim(),
          },
        },
        required: ["description", "title"],
      },
    },
  });

  return response.text;
}
