#!/usr/bin/env node

/**
 * Generate Skills Data for Canvas
 * 从 skill-factory 生成 Canvas 可用的 skills.json
 */

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import {
  loadSkillsFromFactory,
  getSkillFactoryPath,
} from "@onecompany/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("🔄 从 skill-factory 生成 Canvas Skills 数据...\n");

  // 加载所有 Skills
  const factoryPath = await getSkillFactoryPath();
  console.log(`📂 Skill Factory: ${factoryPath}`);

  const result = await loadSkillsFromFactory(factoryPath);
  console.log(`✅ 加载了 ${result.totalCount} 个 Skills\n`);

  // 转换为 Canvas 格式
  const canvasSkills = result.skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    source: skill.source,
    icon: getCategoryIcon(skill.category),
  }));

  // 按类别分组
  const skillsByCategory = {};
  for (const skill of canvasSkills) {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  }

  // 生成输出数据
  const output = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    totalSkills: canvasSkills.length,
    skills: canvasSkills,
    categories: Object.keys(skillsByCategory).sort(),
    byCategory: skillsByCategory,
    sources: {
      superpowers: result.bySource.superpowers?.length || 0,
      "awesome-claude-skills": result.bySource["awesome-claude-skills"]?.length || 0,
      codex: result.bySource.codex?.length || 0,
      custom: result.bySource.custom?.length || 0,
    },
  };

  // 写入文件
  const outputPath = join(
    __dirname,
    "../../packages/canvas-app/src/data/skills-generated.json"
  );
  await writeFile(outputPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`✅ 已生成: ${outputPath}`);
  console.log(`\n📊 统计:`);
  console.log(`   - 总计: ${output.totalSkills} 个 Skills`);
  console.log(`   - 类别: ${output.categories.join(", ")}`);
  console.log(`   - 来源:`);
  for (const [source, count] of Object.entries(output.sources)) {
    if (count > 0) {
      console.log(`     • ${source}: ${count} 个`);
    }
  }

  console.log("\n💡 Canvas 将使用这些真实的 Skills");
}

function getCategoryIcon(category) {
  const icons = {
    frontend: "🎨",
    backend: "⚙️",
    testing: "🧪",
    devops: "🚀",
    documentation: "📝",
    tools: "🔧",
    architecture: "🏗️",
    general: "📦",
  };
  return icons[category] || "📦";
}

main().catch((error) => {
  console.error("❌ 错误:", error.message);
  process.exit(1);
});
