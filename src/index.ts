import * as github from "@actions/github";
import * as core from "@actions/core";
import { GoogleGenAI } from "@google/genai";
import { getAllLabels, getDiff, updatePullRequest } from "./github.utils.js";
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

    const changes = await getDiff(octokit, github.context);
    const labels = await getAllLabels(octokit, github.context);

    const prompt = await getPrompt(changes, labels);
    const result = await getAIResult(gemini, prompt);

    if (result) {
      core.info(`title: ${result.title}`);
      core.info(`description: ${result.description}`);
      core.info(`recommendedLabels: ${result.recommendedLabels.join(' | ')}`);
      
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
