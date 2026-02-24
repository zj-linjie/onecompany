#!/usr/bin/env node

/**
 * Skills Manager CLI
 * 管理和查看 skill-factory 中的 Skills
 */

import {
  loadSkillsFromFactory,
  getRecommendedSkills,
  searchSkills,
  getSkillFactoryPath,
  updateSkillFactoryPath,
} from "@onecompany/core";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command || command === "help") {
    showHelp();
    return;
  }

  if (command === "list") {
    await listSkills();
  } else if (command === "search") {
    const query = args[1];
    if (!query) {
      console.error("❌ 请提供搜索关键词");
      console.log("用法: npm run skills search <关键词>");
      process.exit(1);
    }
    await searchSkillsCommand(query);
  } else if (command === "categories") {
    await showCategories();
  } else if (command === "recommend") {
    const taskType = args[1];
    if (!taskType) {
      console.error("❌ 请提供任务类型");
      console.log("用法: npm run skills recommend <frontend|backend|fullstack|testing>");
      process.exit(1);
    }
    await recommendSkills(taskType);
  } else if (command === "config") {
    await showConfig();
  } else if (command === "set-path") {
    const newPath = args[1];
    if (!newPath) {
      console.error("❌ 请提供 skill-factory 路径");
      console.log("用法: npm run skills set-path <路径>");
      process.exit(1);
    }
    await setSkillFactoryPath(newPath);
  } else {
    console.error(`❌ 未知命令: ${command}`);
    showHelp();
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    Skills Manager CLI                          ║
║              管理 skill-factory 中的 Skills                     ║
╚════════════════════════════════════════════════════════════════╝

命令:
  list                    列出所有可用的 Skills
  search <关键词>          搜索 Skills
  categories              按类别显示 Skills
  recommend <类型>        推荐适合特定任务类型的 Skills
  config                  显示当前配置
  set-path <路径>         设置 skill-factory 路径
  help                    显示此帮助信息

示例:
  npm run skills list
  npm run skills search "react"
  npm run skills categories
  npm run skills recommend frontend
  npm run skills set-path /path/to/skill-factory
`);
}

async function listSkills() {
  const factoryPath = await getSkillFactoryPath();
  console.log(`\n📂 从 ${factoryPath} 加载 Skills...\n`);

  const result = await loadSkillsFromFactory(factoryPath);

  console.log(`✅ 共找到 ${result.totalCount} 个 Skills\n`);

  // 按来源显示统计
  console.log("📊 按来源统计:");
  for (const [source, skills] of Object.entries(result.bySource)) {
    console.log(`  - ${source}: ${skills.length} 个`);
  }

  console.log("\n📊 按类别统计:");
  for (const [category, skills] of Object.entries(result.byCategory)) {
    console.log(`  - ${category}: ${skills.length} 个`);
  }

  console.log("\n💡 使用 'npm run skills categories' 查看详细分类");
  console.log("💡 使用 'npm run skills search <关键词>' 搜索 Skills");
}

async function searchSkillsCommand(query) {
  const factoryPath = await getSkillFactoryPath();
  console.log(`\n🔍 搜索 "${query}"...\n`);

  const result = await loadSkillsFromFactory(factoryPath);
  const matches = searchSkills(result.skills, query);

  if (matches.length === 0) {
    console.log("❌ 未找到匹配的 Skills");
    return;
  }

  console.log(`✅ 找到 ${matches.length} 个匹配的 Skills:\n`);

  for (const skill of matches.slice(0, 20)) {
    console.log(`📦 ${skill.name}`);
    console.log(`   ID: ${skill.id}`);
    console.log(`   类别: ${skill.category}`);
    console.log(`   来源: ${skill.source}`);
    console.log(`   描述: ${skill.description.substring(0, 100)}...`);
    console.log("");
  }

  if (matches.length > 20) {
    console.log(`... 还有 ${matches.length - 20} 个结果未显示`);
  }
}

async function showCategories() {
  const factoryPath = await getSkillFactoryPath();
  console.log(`\n📂 从 ${factoryPath} 加载 Skills...\n`);

  const result = await loadSkillsFromFactory(factoryPath);

  console.log(`✅ 共 ${result.totalCount} 个 Skills，按类别分组:\n`);

  const categories = Object.keys(result.byCategory).sort();

  for (const category of categories) {
    const skills = result.byCategory[category];
    console.log(`\n📁 ${category.toUpperCase()} (${skills.length} 个):`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    for (const skill of skills.slice(0, 10)) {
      console.log(`  • ${skill.name} (${skill.id})`);
      console.log(`    ${skill.description.substring(0, 80)}...`);
    }

    if (skills.length > 10) {
      console.log(`  ... 还有 ${skills.length - 10} 个 Skills`);
    }
  }
}

async function recommendSkills(taskType) {
  const factoryPath = await getSkillFactoryPath();
  console.log(`\n🎯 为 "${taskType}" 任务推荐 Skills...\n`);

  const result = await loadSkillsFromFactory(factoryPath);
  const recommended = getRecommendedSkills(result.skills, taskType);

  if (recommended.length === 0) {
    console.log("❌ 未找到推荐的 Skills");
    return;
  }

  console.log(`✅ 推荐 ${recommended.length} 个 Skills:\n`);

  // 按类别分组显示
  const byCategory = {};
  for (const skill of recommended) {
    if (!byCategory[skill.category]) {
      byCategory[skill.category] = [];
    }
    byCategory[skill.category].push(skill);
  }

  for (const [category, skills] of Object.entries(byCategory)) {
    console.log(`\n📁 ${category.toUpperCase()}:`);
    for (const skill of skills.slice(0, 5)) {
      console.log(`  • ${skill.name} (${skill.id})`);
    }
    if (skills.length > 5) {
      console.log(`  ... 还有 ${skills.length - 5} 个`);
    }
  }
}

async function showConfig() {
  const factoryPath = await getSkillFactoryPath();
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                      当前配置                                   ║
╚════════════════════════════════════════════════════════════════╝

📂 Skill Factory 路径: ${factoryPath}

💡 使用 'npm run skills set-path <路径>' 修改路径
`);
}

async function setSkillFactoryPath(newPath) {
  console.log(`\n📝 更新 skill-factory 路径为: ${newPath}\n`);

  await updateSkillFactoryPath(newPath);

  console.log("✅ 配置已更新");
  console.log("\n💡 使用 'npm run skills list' 验证新路径");
}

main().catch((error) => {
  console.error("❌ 错误:", error.message);
  process.exit(1);
});
