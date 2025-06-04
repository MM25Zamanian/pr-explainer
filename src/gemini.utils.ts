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
            description: `A Markdown-formatted, technically detailed explanation of what has changed in this pull request. It must analyze the patch content and summarize all significant modifications to logic, models, configurations, workflows, or code structure.`,
          },
          title: {
            type: Type.STRING,
            description: `A one-line Conventional Commit title in the format <type>(scope): description. Valid types: feat, fix, refactor, chore, test, docs, ci, build. Scope must reflect the main area changed.`,
          },
          recommendedLabels: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: `A list of GitHub labels selected from the provided availableLabels array that best describe the type and area of changes in this pull request.`,
          },
        },
        required: ["description", "title", "recommendedLabels"],
      },
    },
  });

  if (!response.text) {
    throw new Error("gemini not have text result");
  }

  return JSON.parse(response.text) as { description: string; title: string };
}
