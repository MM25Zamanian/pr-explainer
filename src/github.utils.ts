import { GitHub } from "@actions/github/lib/utils.js";
import * as github from "@actions/github";

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
