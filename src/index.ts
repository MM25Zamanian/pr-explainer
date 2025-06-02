import * as github from "@actions/github";
import * as core from "@actions/core";
import { GoogleGenAI } from "@google/genai";
import { getDiff } from "./github.utils";
import { getAIResult, getPrompt } from "./gemini.utils";

async function main() {
  const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
  const geminiApiKey = core.getInput("GEMINI_API_KEY", { required: true });

  const gemini = new GoogleGenAI({
    apiKey: geminiApiKey,
  });
  const octokit = github.getOctokit(githubToken);

  const diff = await getDiff(octokit, github.context);

  const prompt = await getPrompt(diff);
  const result = await getAIResult(gemini, prompt);

  console.log(result);
}

main();
