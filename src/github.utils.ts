import { GitHub } from "@actions/github/lib/utils.js";
import * as github from "@actions/github";
import * as core from '@actions/core';

export async function getDiff(
  octokit: InstanceType<typeof GitHub>,
  context: typeof github.context
) {
  const { data } = await octokit.rest.pulls.listFiles({
    ...context.repo,
    pull_number: context.payload.pull_request?.number ?? 1,
  });

  return data.map((file) => ({
    filename: file.filename,
    patch: file.patch || "",
  }));
}

export async function getAllLabels(
  octokit: ReturnType<typeof github.getOctokit>,
  context: typeof github.context
): Promise<{ name: string; description: string }[]> {
  return octokit.rest.issues
    .listLabelsForRepo(context.repo)
    .then((result) => result.data)
    .then((labels) =>
      labels.map((label) => ({
        name: label.name,
        description: label.description || "",
      }))
    );
}

export async function updatePullRequest(
  octokit: ReturnType<typeof github.getOctokit>,
  context: typeof github.context,
  body: string,
  title: string
) {
  await octokit.rest.pulls.update({
    ...context.repo,
    pull_number: context.payload.pull_request?.number ?? 1,
    body,
    title,
  });
}

export async function updatePullRequestLabels(
  octokit: ReturnType<typeof github.getOctokit>,
  context: typeof github.context,
  labels: string[]
) {
  const prID = context.payload.pull_request!.number;

  await octokit.rest.issues.setLabels({
    ...context.repo,
    issue_number: prID,
    labels,
  });
}
