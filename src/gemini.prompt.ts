export function generateGeminiPrompt(
  availableLabels: {
    name: string;
    description: string;
  }[],
  changes: {
    filename: string;
    patch: string;
  }[]
): string {
  const stringifiedAvailableLabels = JSON.stringify(availableLabels);
  const stringifiedChanges = JSON.stringify(changes);

  const promptTemplate = `
  You are an expert senior software engineer assistant tasked with generating exceptionally clear, engaging, and technically precise documentation and metadata for GitHub pull requests.
  
  **Available GitHub Labels for this repository:**
  \`\`\`json
  ${stringifiedAvailableLabels}
  \`\`\`
  
  **Pull Request Code Changes (Diffs):**
  \`\`\`json
  ${stringifiedChanges}
  \`\`\`
  
  Based on the **Pull Request Code Changes** and the list of **Available GitHub Labels** provided above, please generate the following in JSON format:
  
  **1. Pull Request Description:**
     Craft a comprehensive and highly structured technical explanation of the changes. This description will be the main body of the pull request. It must:
     - Be written in fluent, professional, and engaging English.
     - Utilize Markdown extensively for clear structure:
       - Use headings (e.g., \`## Core Logic Changes\`, \`### File: path/to/your/file.ts\`) to organize sections.
       - Employ bullet points or numbered lists for specific modifications, new functionalities, or bug fixes.
       - Include \`code_inline\` for variable names, function names, or short snippets.
       - Use \`code blocks\` (with language identifiers if applicable) for more extensive relevant code examples or schema definitions.
     - Be visually appealing and enhance understanding by appropriately using emojis to signify the nature or impact of changes (e.g., ✨ for new features or significant enhancements, 🐛 for bug fixes, ♻️ for refactoring, ⚙️ for configuration, build, or workflow updates, 📝 for documentation changes, ⚡️ for performance improvements, 🔒 for security-related changes). Emojis should add clarity and a positive tone.
     - Provide a technically deep and accurate analysis of the *full patch content* of each modified file.
     - Summarize all meaningful code-level or structural modifications, focusing on changes to functionality, logic, data models/schemas, API endpoints, UI components, critical workflows, or configurations.
     - Clearly mention the specific files involved and the essence of the changes within them.
  
  **2. Conventional Commit Title:**
     Generate a concise, one-line title that strictly adheres to the Conventional Commits standard:
     - Format: \`<type>(scope): short description in imperative mood\`
     - Valid types: \`feat\`, \`fix\`, \`refactor\`, \`chore\`, \`test\`, \`docs\`, \`ci\`, \`build\`.
     - Scope: This is a **required** part, enclosed in parentheses. It must accurately and specifically identify the primary area, component, or module affected by the changes (e.g., \`user-auth\`, \`api-gateway\`, \`payment-schema\`, \`ci-pipeline\`, \`docs-readme\`). Be as precise as possible with the scope.
  
  **3. Recommended GitHub Labels:**
     From the **Available GitHub Labels** list (provided at the very beginning of this prompt), select and return an array of label strings that you deem most suitable and descriptive for this pull request, based on your comprehensive analysis of its content and changes.
  `;

  return promptTemplate.trim();
}
