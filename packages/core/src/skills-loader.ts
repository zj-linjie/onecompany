/**
 * Skills Loader
 * 从外部 skill-factory 目录加载真实可用的 Skills
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, basename } from "node:path";

export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
  source: "superpowers" | "awesome-claude-skills" | "codex" | "custom";
  license?: string;
}

export interface SkillsLoadResult {
  skills: SkillMetadata[];
  totalCount: number;
  byCategory: Record<string, SkillMetadata[]>;
  bySource: Record<string, SkillMetadata[]>;
}

/**
 * 解析 SKILL.md 文件的 frontmatter
 */
function parseFrontmatter(content: string): Record<string, string> {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {};
  }

  const frontmatter: Record<string, string> = {};
  const lines = match[1]?.split("\n") || [];

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

/**
 * 推断 Skill 的类别
 */
function inferCategory(skillName: string, description: string, path: string): string {
  const text = `${skillName} ${description} ${path}`.toLowerCase();

  // Frontend 相关
  if (
    /react|vue|ui|ux|css|html|component|canvas|theme|frontend|web.*app/i.test(text)
  ) {
    return "frontend";
  }

  // Backend 相关
  if (
    /api|backend|server|database|auth|mcp|deploy|service|redis|postgres/i.test(text)
  ) {
    return "backend";
  }

  // Testing 相关
  if (/test|testing|qa|debug|verification/i.test(text)) {
    return "testing";
  }

  // DevOps 相关
  if (/docker|ci|cd|deploy|git|worktree|github|gh-/i.test(text)) {
    return "devops";
  }

  // 文档和产品相关
  if (
    /doc|document|changelog|meeting|content|research|writer|internal.*comm/i.test(text)
  ) {
    return "documentation";
  }

  // 架构和规划
  if (/architect|plan|brainstorm|design|subagent/i.test(text)) {
    return "architecture";
  }

  // 工具类
  if (/tool|utility|helper|organizer|builder|creator/i.test(text)) {
    return "tools";
  }

  return "general";
}

/**
 * 递归扫描目录查找 SKILL.md 文件
 */
async function findSkillFiles(dir: string): Promise<string[]> {
  const skillFiles: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // 跳过 node_modules, .git 等目录
      if (entry.name.startsWith(".") || entry.name === "node_modules") {
        continue;
      }

      if (entry.isDirectory()) {
        const subSkills = await findSkillFiles(fullPath);
        skillFiles.push(...subSkills);
      } else if (entry.name === "SKILL.md") {
        skillFiles.push(fullPath);
      }
    }
  } catch (error) {
    // 忽略无法访问的目录
  }

  return skillFiles;
}

/**
 * 解析单个 SKILL.md 文件
 */
async function parseSkillFile(
  filePath: string,
  factoryRoot: string
): Promise<SkillMetadata | null> {
  try {
    const content = await readFile(filePath, "utf-8");
    const frontmatter = parseFrontmatter(content);

    // 提取 skill 名称和描述
    const name = frontmatter.name || basename(filePath.replace("/SKILL.md", ""));
    const description = frontmatter.description || "";

    // 确定来源
    let source: SkillMetadata["source"] = "custom";
    if (filePath.includes("/superpowers/")) {
      source = "superpowers";
    } else if (filePath.includes("/awesome-claude-skills/")) {
      source = "awesome-claude-skills";
    } else if (filePath.includes("/codex/")) {
      source = "codex";
    }

    // 生成 ID（使用相对路径）
    const relativePath = filePath.replace(factoryRoot, "").replace(/^\//, "");
    const id = relativePath
      .replace("/SKILL.md", "")
      .replace(/\//g, "-")
      .toLowerCase();

    // 推断类别
    const category = inferCategory(name, description, filePath);

    return {
      id,
      name,
      description,
      category,
      path: filePath,
      source,
      license: frontmatter.license,
    };
  } catch (error) {
    console.error(`Failed to parse skill file ${filePath}:`, error);
    return null;
  }
}

/**
 * 从 skill-factory 加载所有 Skills
 */
export async function loadSkillsFromFactory(
  factoryPath: string
): Promise<SkillsLoadResult> {
  console.log(`Loading skills from: ${factoryPath}`);

  // 查找所有 SKILL.md 文件
  const skillFiles = await findSkillFiles(factoryPath);
  console.log(`Found ${skillFiles.length} skill files`);

  // 解析所有 Skills
  const skillPromises = skillFiles.map((file) =>
    parseSkillFile(file, factoryPath)
  );
  const parsedSkills = await Promise.all(skillPromises);

  // 过滤掉解析失败的
  const skills = parsedSkills.filter(
    (skill): skill is SkillMetadata => skill !== null
  );

  // 按类别分组
  const byCategory: Record<string, SkillMetadata[]> = {};
  for (const skill of skills) {
    if (!byCategory[skill.category]) {
      byCategory[skill.category] = [];
    }
    byCategory[skill.category]!.push(skill);
  }

  // 按来源分组
  const bySource: Record<string, SkillMetadata[]> = {};
  for (const skill of skills) {
    if (!bySource[skill.source]) {
      bySource[skill.source] = [];
    }
    bySource[skill.source]!.push(skill);
  }

  console.log(`Successfully loaded ${skills.length} skills`);
  console.log(`Categories: ${Object.keys(byCategory).join(", ")}`);
  console.log(
    `Sources: ${Object.keys(bySource)
      .map((s) => `${s}(${bySource[s]!.length})`)
      .join(", ")}`
  );

  return {
    skills,
    totalCount: skills.length,
    byCategory,
    bySource,
  };
}

/**
 * 获取推荐的 Skills（基于任务类型）
 */
export function getRecommendedSkills(
  allSkills: SkillMetadata[],
  taskType: string
): SkillMetadata[] {
  const categoryMap: Record<string, string[]> = {
    frontend: ["frontend", "testing", "devops"],
    backend: ["backend", "testing", "devops"],
    fullstack: ["frontend", "backend", "testing", "devops"],
    testing: ["testing", "devops"],
    documentation: ["documentation", "tools"],
    architecture: ["architecture", "general"],
  };

  const relevantCategories = categoryMap[taskType] || ["general"];

  return allSkills.filter((skill) =>
    relevantCategories.includes(skill.category)
  );
}

/**
 * 搜索 Skills
 */
export function searchSkills(
  allSkills: SkillMetadata[],
  query: string
): SkillMetadata[] {
  const lowerQuery = query.toLowerCase();

  return allSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.id.toLowerCase().includes(lowerQuery)
  );
}
