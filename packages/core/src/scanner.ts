import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { ScanSummary } from "./types.js";

const MAX_SCAN_FILES = 5000;
const DOC_BASELINE = [
  "README.md",
  "docs/00-project-brief.md",
  "docs/01-architecture.md",
  "docs/03-task-board.md"
];

interface ScanContext {
  files: string[];
  fileCount: number;
  packageJson?: Record<string, unknown>;
}

async function walkFiles(root: string): Promise<string[]> {
  const queue = [root];
  const output: string[] = [];

  while (queue.length > 0 && output.length < MAX_SCAN_FILES) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    let entries: string[] = [];
    try {
      entries = await readdir(current, { withFileTypes: false });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const full = path.join(current, entry);
      let s;
      try {
        s = await stat(full);
      } catch {
        continue;
      }

      if (s.isDirectory()) {
        if (["node_modules", ".git", "dist", "build", ".next", ".turbo"].includes(entry)) {
          continue;
        }
        queue.push(full);
      } else if (s.isFile()) {
        output.push(full);
        if (output.length >= MAX_SCAN_FILES) {
          break;
        }
      }
    }
  }

  return output;
}

function rel(root: string, absPath: string): string {
  return path.relative(root, absPath).replace(/\\/g, "/");
}

function detectLanguages(files: string[]): string[] {
  const languages = new Set<string>();
  for (const file of files) {
    if (file.endsWith(".ts") || file.endsWith(".tsx")) languages.add("TypeScript");
    if (file.endsWith(".js") || file.endsWith(".jsx")) languages.add("JavaScript");
    if (file.endsWith(".py")) languages.add("Python");
    if (file.endsWith(".go")) languages.add("Go");
    if (file.endsWith(".rs")) languages.add("Rust");
    if (file.endsWith(".java")) languages.add("Java");
    if (file.endsWith(".kt")) languages.add("Kotlin");
    if (file.endsWith(".swift")) languages.add("Swift");
  }
  return [...languages].sort((a, b) => a.localeCompare(b));
}

function detectPackageManagers(files: string[]): string[] {
  const managers = new Set<string>();
  for (const file of files) {
    if (file.endsWith("package-lock.json")) managers.add("npm");
    if (file.endsWith("pnpm-lock.yaml")) managers.add("pnpm");
    if (file.endsWith("yarn.lock")) managers.add("yarn");
    if (file.endsWith("poetry.lock") || file.endsWith("requirements.txt")) managers.add("pip/poetry");
    if (file.endsWith("go.mod")) managers.add("go mod");
    if (file.endsWith("Cargo.lock")) managers.add("cargo");
  }
  return [...managers].sort((a, b) => a.localeCompare(b));
}

function detectFrameworks(files: string[], packageJson?: Record<string, unknown>): string[] {
  const frameworks = new Set<string>();
  const deps = new Set<string>();

  if (packageJson) {
    const depBuckets = ["dependencies", "devDependencies", "peerDependencies"] as const;
    for (const bucket of depBuckets) {
      const values = packageJson[bucket];
      if (values && typeof values === "object") {
        for (const key of Object.keys(values as Record<string, string>)) {
          deps.add(key);
        }
      }
    }
  }

  if (deps.has("react")) frameworks.add("React");
  if (deps.has("next")) frameworks.add("Next.js");
  if (deps.has("vue")) frameworks.add("Vue");
  if (deps.has("@nestjs/core")) frameworks.add("NestJS");
  if (deps.has("express")) frameworks.add("Express");
  if (deps.has("fastify")) frameworks.add("Fastify");
  if (deps.has("electron")) frameworks.add("Electron");

  const joined = files.join("\n");
  if (/dockerfile/i.test(joined)) frameworks.add("Docker");
  if (/\.github\/workflows\//i.test(joined)) frameworks.add("GitHub Actions");

  return [...frameworks].sort((a, b) => a.localeCompare(b));
}

function detectDocs(files: string[]): string[] {
  const docs = new Set<string>();
  for (const file of files) {
    const base = path.basename(file).toLowerCase();
    if (base === "readme.md") docs.add("README.md");
    if (base.endsWith(".md") && /docs\//i.test(file)) docs.add("docs/*.md");
    if (base === "architecture.md") docs.add("architecture.md");
    if (base === "changelog.md") docs.add("CHANGELOG.md");
    if (base === "contributing.md") docs.add("CONTRIBUTING.md");
  }
  return [...docs].sort((a, b) => a.localeCompare(b));
}

function detectMissingFoundations(relFiles: string[]): string[] {
  const fileSet = new Set(relFiles);
  return DOC_BASELINE.filter((required) => !fileSet.has(required));
}

function detectRisks(ctx: ScanContext, missing: string[]): string[] {
  const risks: string[] = [];
  const files = ctx.files;

  const hasTests = files.some((file) =>
    /(^|\/)(test|tests|__tests__|specs)($|\/)|\.(test|spec)\.(ts|tsx|js|jsx|py)$/i.test(file)
  );
  if (!hasTests) {
    risks.push("未发现明显测试目录或测试文件，存在回归风险");
  }

  const hasCI = files.some((file) => file.includes(".github/workflows/"));
  if (!hasCI) {
    risks.push("未发现 CI 工作流配置，质量门禁可能缺失");
  }

  if (missing.length > 0) {
    risks.push("关键文档缺失，团队接管和持续迭代成本偏高");
  }

  if (!ctx.packageJson) {
    risks.push("未发现 package.json，Node 项目依赖信息可能不完整");
  }

  return risks;
}

function buildRecommendations(risks: string[]): string[] {
  const recs = [
    "先补齐 Brief/Architecture/Task Board 三份核心文档",
    "定义最小可验证命令（build/test/run）并固化到文档",
    "每次迭代结束执行统一质量门禁（评审、验证、收尾）"
  ];

  if (risks.some((risk) => risk.includes("测试"))) {
    recs.push("优先为关键路径补齐单元测试和回归测试样例");
  }

  if (risks.some((risk) => risk.includes("CI"))) {
    recs.push("建立基础 CI 流水线，至少覆盖 lint + test + build");
  }

  return recs;
}

export async function scanExistingProject(sourcePath: string, projectName: string): Promise<ScanSummary> {
  const absSource = path.resolve(sourcePath);
  const allAbs = await walkFiles(absSource);
  const allRel = allAbs.map((file) => rel(absSource, file));

  let packageJson: Record<string, unknown> | undefined;
  const packageJsonPath = path.join(absSource, "package.json");
  try {
    const raw = await readFile(packageJsonPath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    packageJson = parsed;
  } catch {
    // ignore invalid or missing package.json
  }

  const languages = detectLanguages(allRel);
  const packageManagers = detectPackageManagers(allRel);
  const frameworks = detectFrameworks(allRel, packageJson);
  const docsFound = detectDocs(allRel);
  const missingFoundations = detectMissingFoundations(allRel);
  const risks = detectRisks({ files: allRel, fileCount: allRel.length, packageJson }, missingFoundations);
  const recommendations = buildRecommendations(risks);

  return {
    sourcePath: absSource,
    projectName,
    fileCount: allRel.length,
    languages,
    frameworks,
    packageManagers,
    docsFound,
    missingFoundations,
    risks,
    recommendations
  };
}
