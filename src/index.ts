import * as github from "@actions/github";
import * as core from "@actions/core";
import { GoogleGenAI } from "@google/genai";
import { getDiff } from "./github.utils.js";
import { getAIResult, getPrompt } from "./gemini.utils.js";

async function main() {
  try {
    const githubToken = core.getInput("GITHUB_TOKEN");
    core.warning(`DEBUG: GITHUB_TOKEN value is "${githubToken}"`);

    if (!githubToken) {
      core.setFailed("DEBUG: GITHUB_TOKEN is empty or not supplied!");
      return;
    }
    const geminiApiKey = core.getInput("GEMINI_API_KEY", {
      required: true,
      trimWhitespace: true,
    });

    core.info(`GITHUB_TOKEN: ${githubToken}`)
    core.info(`GEMINI_API_KEY: ${geminiApiKey}`)

    const gemini = new GoogleGenAI({
      apiKey: geminiApiKey,
    });
    const octokit = github.getOctokit(githubToken);

    const diff = await getDiff(octokit, github.context);

    const prompt = await getPrompt(diff);
    const result = await getAIResult(gemini, prompt);

    result && core.info(result);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error);
  }
}

main();
