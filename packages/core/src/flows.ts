import path from "node:path";
import { appendFile, stat } from "node:fs/promises";
import {
  architectureTemplate,
  changeLogTemplate,
  devLogTemplate,
  prdTemplate,
  projectBriefTemplate,
  takeoverArchitectureTemplate,
  takeoverBriefTemplate,
  takeoverTaskBoardTemplate,
  taskBoardTemplate
} from "./templates.js";
import { ensureDir, isoNow, slugify, writeText } from "./project.js";
import { getRoleSkillBundles, routeSkillsByTask } from "./skills.js";
import { scanExistingProject } from "./scanner.js";
import type {
  IterateInput,
  IterateResult,
  NewProjectInput,
  NewProjectResult,
  TakeoverInput,
  TakeoverResult
} from "./types.js";

const QUALITY_GATES = [
  "requesting-code-review：完成任务后先进行代码评审",
  "verification-before-completion：运行验证命令并核对输出",
  "finishing-a-development-branch：确认收尾策略（PR/merge/cleanup）",
  "更新 docs/04-dev-log.md 与 docs/05-change-log.md"
];

function getWorkspacePath(workspaceRoot: string, projectName: string): string {
  return path.join(workspaceRoot, slugify(projectName));
}

export async function runNewProjectFlow(input: NewProjectInput): Promise<NewProjectResult> {
  const workspacePath = getWorkspacePath(input.workspaceRoot, input.projectName);
  const docsPath = path.join(workspacePath, "docs");

  await ensureDir(docsPath);

  const briefPath = path.join(docsPath, "00-project-brief.md");
  const architecturePath = path.join(docsPath, "01-architecture.md");
  const prdPath = path.join(docsPath, "02-prd.md");
  const taskBoardPath = path.join(docsPath, "03-task-board.md");
  const devLogPath = path.join(docsPath, "04-dev-log.md");
  const changeLogPath = path.join(docsPath, "05-change-log.md");
  const manifestPath = path.join(workspacePath, ".onecompany", "project.json");

  const files = [briefPath, architecturePath, prdPath, taskBoardPath, devLogPath, changeLogPath, manifestPath];

  await writeText(briefPath, projectBriefTemplate(input));
  await writeText(architecturePath, architectureTemplate(input.projectName));
  await writeText(prdPath, prdTemplate(input.projectName));
  await writeText(taskBoardPath, taskBoardTemplate());
  await writeText(devLogPath, devLogTemplate());
  await writeText(changeLogPath, changeLogTemplate());
  await writeText(
    manifestPath,
    JSON.stringify(
      {
        projectName: input.projectName,
        projectDescription: input.projectDescription,
        productMode: input.productMode,
        createdAt: isoNow(),
        roleBundles: getRoleSkillBundles()
      },
      null,
      2
    )
  );

  return {
    workspacePath,
    createdFiles: files,
    roleBundles: getRoleSkillBundles()
  };
}

export async function runTakeoverFlow(input: TakeoverInput): Promise<TakeoverResult> {
  const sourceAbs = path.resolve(input.sourcePath);
  const sourceStat = await stat(sourceAbs);
  if (!sourceStat.isDirectory()) {
    throw new Error(`sourcePath is not a directory: ${sourceAbs}`);
  }

  const projectName = input.projectName?.trim() || path.basename(sourceAbs);
  const workspacePath = getWorkspacePath(input.workspaceRoot, projectName);
  const docsPath = path.join(workspacePath, "docs");

  await ensureDir(docsPath);

  const scan = await scanExistingProject(sourceAbs, projectName);

  const briefPath = path.join(docsPath, "00-project-brief.md");
  const architecturePath = path.join(docsPath, "01-architecture.md");
  const taskBoardPath = path.join(docsPath, "03-task-board.md");
  const takeoverPath = path.join(workspacePath, ".onecompany", "takeover.json");

  const files = [briefPath, architecturePath, taskBoardPath, takeoverPath];

  await writeText(briefPath, takeoverBriefTemplate(scan, input.owner));
  await writeText(architecturePath, takeoverArchitectureTemplate(scan));
  await writeText(taskBoardPath, takeoverTaskBoardTemplate(scan));
  await writeText(
    takeoverPath,
    JSON.stringify(
      {
        sourcePath: scan.sourcePath,
        importedAt: isoNow(),
        scan
      },
      null,
      2
    )
  );

  return {
    workspacePath,
    scan,
    createdFiles: files
  };
}

export async function runIterateFlow(input: IterateInput): Promise<IterateResult> {
  const route = routeSkillsByTask(input.taskTitle);
  const docsPath = path.join(input.workspacePath, "docs");
  const devLogPath = path.join(docsPath, "04-dev-log.md");
  const changeLogPath = path.join(docsPath, "05-change-log.md");

  await ensureDir(docsPath);

  const line = [
    `## ${new Date().toLocaleString()}`,
    `- Actor: ${input.actor}`,
    `- Task: ${input.taskTitle}`,
    `- Task Type: ${route.taskType}`,
    `- Routed Skills: ${route.skills.join(", ")}`,
    `- Route Reason: ${route.reason}`,
    ""
  ].join("\n");

  await appendFile(devLogPath, line, "utf8");

  await appendFile(
    changeLogPath,
    `\n- ${new Date().toISOString().slice(0, 10)}: Started iteration task \"${input.taskTitle}\"`,
    "utf8"
  );

  return {
    taskType: route.taskType,
    skills: route.skills,
    devLogPath,
    qualityGates: QUALITY_GATES
  };
}
