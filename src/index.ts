import * as github from "@actions/github";
import * as core from "@actions/core";
import { GoogleGenAI } from "@google/genai";
import {
  getAllLabels,
  getDiff,
  updatePullRequest,
  updatePullRequestLabels,
} from "./github.utils.js";
import { getAIResult } from "./gemini.utils.js";
import { generateGeminiPrompt } from "./gemini.prompt.js";

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

    const prompt = generateGeminiPrompt(labels, changes);
    const result = await getAIResult(gemini, prompt);

    if (result) {
      core.info(`title: ${result.title}`);
      core.info(`description: ${result.description}`);
      core.info(`recommendedLabels: ${result.recommendedLabels.join(" | ")}`);

      await updatePullRequest(
        octokit,
        github.context,
        result.description,
        result.title
      );

      await updatePullRequestLabels(
        octokit,
        github.context,
        result.recommendedLabels
      );
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error);
  }
}

main();
