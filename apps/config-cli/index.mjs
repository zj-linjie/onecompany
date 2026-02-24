#!/usr/bin/env node

/**
 * OneCompany 配置管理 CLI
 * 管理 API Key 和其他配置
 */

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  loadConfig,
  setAnthropicApiKey,
  getAnthropicApiKey,
  updateSkillFactoryPath,
  getSkillFactoryPath,
} from "@onecompany/core";

const rl = createInterface({ input, output });

const args = process.argv.slice(2);
const command = args[0];
const value = args[1];

async function main() {
  if (!command || command === "help") {
    showHelp();
    return;
  }

  if (command === "show") {
    await showConfig();
  } else if (command === "set-api-key") {
    await setApiKey(value);
  } else if (command === "test-api-key") {
    await testApiKey();
  } else if (command === "set-skill-factory") {
    await setSkillFactory(value);
  } else {
    console.error(`❌ 未知命令: ${command}`);
    showHelp();
    process.exit(1);
  }

  rl.close();
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  OneCompany 配置管理                            ║
╚════════════════════════════════════════════════════════════════╝

命令:
  show                        显示当前配置
  set-api-key [key]          设置 Anthropic API Key
  test-api-key               测试 API Key 是否有效
  set-skill-factory <path>   设置 skill-factory 路径
  help                       显示此帮助

示例:
  npm run config show
  npm run config set-api-key sk-ant-...
  npm run config test-api-key
  npm run config set-skill-factory /path/to/skill-factory

环境变量:
  ANTHROPIC_API_KEY          Anthropic API Key（优先级高于配置文件）

配置文件位置:
  ~/.onecompany/config.json
`);
}

async function showConfig() {
  const config = await loadConfig();
  const apiKey = await getAnthropicApiKey();
  const skillFactoryPath = await getSkillFactoryPath();

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                      当前配置                                   ║
╚════════════════════════════════════════════════════════════════╝

📂 Skill Factory 路径: ${skillFactoryPath}

🔑 Anthropic API Key: ${
    apiKey
      ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)} ${
          process.env.ANTHROPIC_API_KEY ? "(来自环境变量)" : "(来自配置文件)"
        }`
      : "未设置"
  }

📝 配置文件版本: ${config.version}

💡 提示:
  - 使用 'npm run config set-api-key' 设置 API Key
  - 使用 'npm run config test-api-key' 测试 API Key
  - 使用环境变量 ANTHROPIC_API_KEY 可以覆盖配置文件中的 API Key
`);
}

async function setApiKey(key) {
  let apiKey = key;

  if (!apiKey) {
    console.log("\n请输入你的 Anthropic API Key:");
    console.log("(可以从 https://console.anthropic.com/ 获取)\n");
    apiKey = await rl.question("API Key: ");
  }

  if (!apiKey || !apiKey.trim()) {
    console.error("❌ API Key 不能为空");
    process.exit(1);
  }

  apiKey = apiKey.trim();

  // 验证 API Key 格式
  if (!apiKey.startsWith("sk-ant-")) {
    console.warn("⚠️  警告: API Key 格式可能不正确（应该以 'sk-ant-' 开头）");
    const confirm = await rl.question("是否继续？(y/n): ");
    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
      console.log("❌ 已取消");
      process.exit(0);
    }
  }

  await setAnthropicApiKey(apiKey);

  console.log("\n✅ API Key 已保存到配置文件");
  console.log("💡 使用 'npm run config test-api-key' 测试 API Key");
}

async function testApiKey() {
  console.log("\n🔍 测试 API Key...\n");

  const apiKey = await getAnthropicApiKey();

  if (!apiKey) {
    console.error("❌ API Key 未设置");
    console.log("\n💡 使用 'npm run config set-api-key' 设置 API Key");
    process.exit(1);
  }

  try {
    // 动态导入 Anthropic SDK
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey });

    console.log("📡 发送测试请求到 Anthropic API...");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Hello! Please respond with 'API Key is valid'.",
        },
      ],
    });

    const content = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    console.log("\n✅ API Key 有效！");
    console.log(`\n📊 测试结果:`);
    console.log(`   模型: ${response.model}`);
    console.log(`   输入 tokens: ${response.usage.input_tokens}`);
    console.log(`   输出 tokens: ${response.usage.output_tokens}`);
    console.log(`\n💬 响应: ${content.substring(0, 100)}...`);
    console.log("\n🎉 你现在可以使用 Agent 协作模式了！");
    console.log("💡 运行 'npm run onecompany' 开始使用");
  } catch (error) {
    console.error("\n❌ API Key 测试失败");

    if (error.status === 401) {
      console.error("   错误: API Key 无效或已过期");
      console.log("\n💡 请检查你的 API Key 是否正确");
      console.log("💡 从 https://console.anthropic.com/ 获取新的 API Key");
    } else if (error.status === 429) {
      console.error("   错误: API 请求频率限制");
      console.log("\n💡 请稍后再试");
    } else {
      console.error(`   错误: ${error.message}`);
    }

    process.exit(1);
  }
}

async function setSkillFactory(path) {
  let factoryPath = path;

  if (!factoryPath) {
    const current = await getSkillFactoryPath();
    console.log(`\n当前 skill-factory 路径: ${current}\n`);
    factoryPath = await rl.question("请输入新的路径: ");
  }

  if (!factoryPath || !factoryPath.trim()) {
    console.error("❌ 路径不能为空");
    process.exit(1);
  }

  factoryPath = factoryPath.trim();

  await updateSkillFactoryPath(factoryPath);

  console.log(`\n✅ Skill Factory 路径已更新为: ${factoryPath}`);
  console.log("💡 使用 'npm run skills list' 验证新路径");
}

main().catch((error) => {
  console.error("❌ 错误:", error.message);
  rl.close();
  process.exit(1);
});
