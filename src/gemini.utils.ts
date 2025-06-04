import { GoogleGenAI, Type } from "@google/genai";
import { readFile } from "fs/promises";
import path from "node:path";

async function readPromptTemplateFromFile(): Promise<string> {
  const workspaceDirectory = process.env.GITHUB_WORKSPACE || process.cwd();
  const promptFilePath = path.join(workspaceDirectory, ".prompt");

  try {
    return await readFile(promptFilePath, { encoding: "utf-8" });
  } catch (error) {
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      throw new Error(
        `Prompt template file not found at: ${promptFilePath}. Please ensure the '.prompt' file exists in the root of your repository.`
      );
    }
    throw new Error(
      `Failed to read prompt template file '${promptFilePath}': ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getPrompt(
  changes: unknown,
  labels: unknown[]
): Promise<string> {
  const promptTemplate = await readPromptTemplateFromFile();

  let stringifiedChanges: string;
  try {
    stringifiedChanges = JSON.stringify(changes);
  } catch (error) {
    throw new Error(
      `Failed to serialize changes data for prompt: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  let stringifiedLabels: string;
  try {
    stringifiedLabels = JSON.stringify(labels);
  } catch (error) {
    throw new Error(
      `Failed to serialize labels data for prompt: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return promptTemplate
    .replaceAll("<<CHANGES>>", stringifiedChanges)
    .replaceAll("<<AVAILABLE_LABELS>>", stringifiedLabels);
}

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
