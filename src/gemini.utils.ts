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

export async function getPrompt(input: unknown): Promise<string> {
  const promptTemplate = await readPromptTemplateFromFile();

  let stringifiedInput: string;
  try {
    stringifiedInput = JSON.stringify(input);
  } catch (error) {
    throw new Error(
      `Failed to serialize input data for prompt: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return promptTemplate.replaceAll("<<CHANGES>>", stringifiedInput);
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

  if (!response.text) {
    throw new Error("gemini not have text result");
  }

  return JSON.parse(response.text) as { description: string; title: string };
}
