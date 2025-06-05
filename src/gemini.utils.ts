import { GoogleGenAI, Type } from "@google/genai";

export async function getAIResult(gemini: GoogleGenAI, prompt: string) {
  const response = await gemini.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      temperature: 1.3,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT, // Assuming 'Type' is correctly imported, e.g., FunctionDeclarationSchemaType from @google/genai
        properties: {
          description: {
            type: Type.STRING,
            description:
              `Generate a comprehensive, exceptionally well-structured, and fluent Markdown-formatted technical explanation of the pull request changes. The explanation must analyze the full patch content, summarize all significant modifications (to logic, models, data schemas, configurations, workflows, UI components, or code structure), and mention specific files. It should be enhanced with appropriate emojis (e.g., ✨, 🐛, ♻️, ⚙️, 📝, ⚡️, 🔒) to improve readability, convey impact, and add a touch of professional polish. Use Markdown headings, lists, and code formatting extensively.`.trim(),
          },
          title: {
            type: Type.STRING,
            description:
              `Create a concise, one-line Conventional Commit title following the strict format: <type>(scope): short description in imperative mood. Valid types include: feat, fix, refactor, chore, test, docs, ci, build. The 'scope' is mandatory and must precisely reflect the main area, component, or module impacted by the PR (e.g., user-auth, api-gateway, payment-schema).`.trim(),
          },
          recommendedLabels: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING, // Each item in the array will be a string (label name)
            },
            description:
              `Return an array of GitHub label strings. These labels must be selected *exclusively* from the 'Available GitHub Labels' list that was provided in the input prompt. The selection should accurately categorize the pull request based on its analyzed changes.`.trim(),
          },
        },
        required: ["description", "title", "recommendedLabels"],
      },
    },
  });

  if (!response.text) {
    throw new Error("gemini not have text result");
  }

  return JSON.parse(response.text) as {
    description: string;
    title: string;
    recommendedLabels: string[];
  };
}
