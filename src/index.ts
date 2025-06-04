import * as github from "@actions/github";
import * as core from "@actions/core";
import { GoogleGenAI } from "@google/genai";
import { getDiff, updatePullRequest } from "./github.utils.js";
import { getAIResult, getPrompt } from "./gemini.utils.js";

async function main() {
  try {
    const githubToken = core.getInput("GITHUB_TOKEN", {
      required: true,
      trimWhitespace: true,
    });
    const geminiApiKey = core.getInput("GEMINI_API_KEY", {
      required: true,
      trimWhitespace: true,
    });

    const gemini = new GoogleGenAI({
      apiKey: geminiApiKey,
    });
    const octokit = github.getOctokit(githubToken);

    const diff = await getDiff(octokit, github.context);

    const prompt = await getPrompt(diff);
    const result = await getAIResult(gemini, prompt);

    if (result) {
      await updatePullRequest(
        octokit,
        github.context,
        result.description,
        result.title
      );
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error);
  }
}

main();
