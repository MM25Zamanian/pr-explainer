import * as github from "@actions/github";
import * as core from "@actions/core";
import { GoogleGenAI } from "@google/genai";
import { getDiff } from "./github.utils";
import { getAIResult, getPrompt } from "./gemini.utils";

async function main() {
  // const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
  // const geminiApiKey = core.getInput("GEMINI_API_KEY", { required: true });

  const gemini = new GoogleGenAI({
    apiKey: "AIzaSyAn6diqyODS8Q8Xy5rh4g-Um0n7nmSICQk",
  });
  // const octokit = github.getOctokit(githubToken);

  // const diff = await getDiff(octokit, github.context);
  const diff = [
    {
      filename: ".github/workflows/ai-pr.yml",
      patch:
        "@@ -1,18 +1,20 @@\n-name: Code Review\n-\n on:\n   pull_request:\n-    types: [opened, synchronize]\n+    types: [synchronize, reopened, labeled]\n \n jobs:\n-  review:\n+  describe:\n     runs-on: ubuntu-latest\n+    permissions:\n+      contents: write\n     steps:\n-      - name: Checkout code\n-        uses: actions/checkout@v3\n+      - name: Checkout repository\n+        uses: actions/checkout@v4\n+        with:\n+          fetch-depth: 0\n \n-      - name: GPT-4 Code Review\n-        uses: your-username/gpt4-code-review-action@v1\n+      - name: PR Auto Describe\n+        uses: salehhashemi1992/pr-auto-describe@main\n         with:\n-          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n-          OPENAI_API_KEY: ${{ secrets.OPENAI_TOKEN }}\n\\ No newline at end of file\n+          github-token: ${{ secrets.TOKEN }}\n+          openai-api-key: ${{ secrets.OPENAI_TOKEN }}",
    },
    {
      filename: "prisma/schema.prisma",
      patch:
        "@@ -17,3 +17,68 @@ model User {\n   token     String?\n   createdAt DateTime @default(now())\n }\n+\n+model Student {\n+  id                 String   @id @default(cuid())\n+  firstName          String\n+  lastName           String\n+  nationalId         String   @unique\n+  birthPlace         String\n+  mobile             String   @unique // Assuming student mobile should be unique\n+  homePhone          String?\n+  address            String   // Using Text for potentially longer address\n+\n+  // Academic Information\n+  schoolName         String\n+  schoolPhone        String?\n+  firstSemesterGrade Float\n+  mathGrade          Float\n+  scienceGrade       Float\n+\n+  // Father's Information (Embedded)\n+  fatherFirstName    String\n+  fatherLastName     String\n+  fatherJob          String?  // Optional as job situations vary\n+  fatherMobile       String\n+  fatherWorkPhone    String?\n+\n+  // Mother's Information (Embedded)\n+  motherFirstName    String\n+  motherLastName     String\n+  motherJob          String?  // Optional as job situations vary\n+  motherMobile       String\n+  motherWorkPhone    String?\n+\n+  // Uploaded Documents (URLs or file paths)\n+  profilePhotoUrl    String\n+  reportCardUrl      String\n+  idScanPage1Url     String\n+  idScanPage2Url     String? // Assuming page 2 of ID scan might be optional\n+\n+  // Academic Interests (Many-to-Many with Major)\n+  majors             StudentMajor[]\n+\n+  createdAt          DateTime @default(now())\n+  updatedAt          DateTime @updatedAt\n+}\n+\n+model Major {\n+  id        String         @id @default(cuid())\n+  name      String         @unique\n+  students  StudentMajor[]\n+}\n+\n+// Explicit join table for Student-Major Many-to-Many relationship\n+// This provides clarity and is well-supported by SQLite.\n+// Prisma would create an implicit one, but explicit can be better for some SQLite constraints/tooling.\n+model StudentMajor {\n+  studentId String\n+  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade) // Cascade delete if student is removed\n+  majorId   String\n+  major     Major   @relation(fields: [majorId], references: [id], onDelete: Cascade)   // Cascade delete if major is removed\n+\n+  assignedAt DateTime @default(now())\n+\n+  @@id([studentId, majorId]) // Composite primary key\n+  @@map(\"student_majors\")    // Explicit table name for clarity\n+}",
    },
  ];

  const prompt = await getPrompt(diff);
  const result = await getAIResult(gemini, prompt);

  console.log(result);
}

main();
