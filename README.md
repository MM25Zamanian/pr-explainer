# AI-Powered Pull Request Assistant (with Gemini)

[](https://opensource.org/licenses/MIT)
This GitHub Action leverages the power of Google's Gemini AI to intelligently analyze pull request diffs. It automatically generates detailed, structured technical descriptions, crafts Conventional Commit titles, and suggests or applies relevant GitHub labels, significantly streamlining your code review and documentation workflow.

## 📖 Table of Contents

  - [✨ Key Features](https://www.google.com/search?q=%23-key-features)
  - [⚙️ How It Works](https://www.google.com/search?q=%23%EF%B8%8F-how-it-works)
  - [🚀 Getting Started](https://www.google.com/search?q=%23-getting-started)
      - [Prerequisites](https://www.google.com/search?q=%23prerequisites)
      - [Action Inputs](https://www.google.com/search?q=%23action-inputs)
      - [Workflow Permissions](https://www.google.com/search?q=%23workflow-permissions)
      - [Example Workflow](https://www.google.com/search?q=%23example-workflow)
  - [🤝 Contributing](https://www.google.com/search?q=%23-contributing)
  - [📄 License](https://www.google.com/search?q=%23-license)

## ✨ Key Features

  * **Automated PR Descriptions:** Generates comprehensive, technically detailed, and well-structured Markdown descriptions from code changes.
  * **Engaging Writing Style:** Descriptions are crafted to be fluent and can be enhanced with emojis for better readability and to convey the nature of changes.
  * **Standardized Commit Titles:** Automatically creates PR titles adhering to the Conventional Commits standard.
  * **Intelligent Label Management:** Analyzes changes to suggest relevant labels from your repository's existing label set and can automatically apply them to the pull request.
  * **Powered by Gemini AI:** Utilizes the advanced capabilities of the Gemini 1.5 Flash model (or other configured Gemini models) for in-depth code analysis and content generation.
  * **Easy Integration:** Seamlessly integrates into your existing GitHub Workflows.
  * **Time-Saving & Consistency:** Reduces the manual effort required for PR documentation and helps maintain consistency in titles and labels.

## ⚙️ How It Works

This action operates through the following sequence:

1.  **Triggering the Action:** It is activated by specified pull request events within your GitHub workflow (e.g., when a PR is `opened`, `synchronize`d, or `reopened`).
2.  **Fetching Code Changes:** The action first checks out your repository's code and then retrieves the diff (the specific code changes) associated with the triggering pull request.
3.  **Interacting with Gemini AI:**
      * The extracted code diff, along with a carefully engineered prompt (which includes instructions on style, structure, and format) and the list of available labels from your repository, is sent to the Gemini API.
      * Gemini analyzes this information. Guided by a predefined response schema, it returns a structured JSON object containing the suggested PR description, a Conventional Commit title, and a list of recommended labels.
4.  **Updating the Pull Request:**
      * The AI-generated description and title are automatically applied to the pull request's body and title fields.
      * The AI-recommended labels (selected from your repository's available labels) are set on the pull request, replacing any existing labels or adding to them based on configuration (currently, it sets/replaces).

## 🚀 Getting Started

### Prerequisites

1.  **Gemini API Key:** You will need a valid API key from Google AI Studio (or your Gemini API provider). This key must be stored as an [encrypted secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) in your GitHub repository (e.g., named `GEMINI_API_KEY`).
2.  **Defined Repository Labels:** For the label suggestion and application feature to work effectively, ensure you have a set of descriptive labels already defined in your GitHub repository's "Labels" section (accessible via the "Issues" or "Pull requests" tab). The AI will select from these available labels.

### Action Inputs

| Input             | Description                                                                                               | Required | Default                 |
| ----------------- | --------------------------------------------------------------------------------------------------------- | -------- | ----------------------- |
| `GITHUB_TOKEN`    | The default GitHub token automatically provided by GitHub Actions. Used for interacting with the GitHub API (e.g., updating PRs, setting labels). | `true`   | `${{ github.token }}` |
| `GEMINI_API_KEY`  | Your API key for authenticating with the Gemini API. This should be passed from your repository secrets.   | `true`   | N/A                     |

### Workflow Permissions

The `GITHUB_TOKEN` used by the workflow requires specific permissions to allow the action to modify pull requests and their labels. Define these in your workflow file at the job level or workflow level:

```yaml
permissions:
  contents: read          # Required by actions/checkout to read repository content.
  pull-requests: write  # Required to update PR titles and bodies.
  issues: write         # Required to read repository labels and set labels on PRs (as PRs are also issues regarding labels).
```

### Example Workflow

Create a new workflow file (e.g., `.github/workflows/ai_pr_assistant.yml`) in your repository:

```yaml
name: AI PR Assistant

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  ai_pr_processing:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run AI PR Assistant
        uses: MM25Zamanian/pr-explainer@v1.0.0
        with:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

## 🤝 Contributing

Contributions are highly welcome\! Whether it's bug reports, feature suggestions, or pull requests, please feel free to engage with the project.

*(You can expand this section with more specific guidelines for your project, such as local development setup, running tests, coding standards, etc.)*

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file in the repository for full details.

*(Make sure to include a `LICENSE` file (e.g., containing the MIT License text) in the root of your project.)*
