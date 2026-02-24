#!/usr/bin/env node

/**
 * Agent 执行测试脚本
 * 测试真实的 Agent 执行能力
 */

import { createAgentExecutor } from "@onecompany/core";

async function testAgentExecution() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  Agent 执行测试                                 ║
╚════════════════════════════════════════════════════════════════╝
`);

  // 创建一个简单的测试任务
  const task = {
    id: "test-1",
    title: "测试任务：分析 React 组件优化",
    description: `
请分析以下 React 组件的性能问题并提供优化建议：

\`\`\`jsx
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button onClick={() => console.log(user)}>查看详情</button>
        </div>
      ))}
    </div>
  );
}
\`\`\`

请提供：
1. 性能问题分析
2. 优化建议
3. 优化后的代码示例
`,
    type: "frontend",
    status: "ready",
    dependencies: [],
    priority: 1,
    createdAt: new Date(),
  };

  const context = {
    workspacePath: "/Users/apple/dev/onecompany",
    projectDocs: [],
    previousTasks: [],
  };

  console.log("📋 测试任务:");
  console.log(`   标题: ${task.title}`);
  console.log(`   类型: ${task.type}`);
  console.log("");

  try {
    // 创建前端开发 Agent
    console.log("🤖 创建前端开发 Agent...");
    const agent = createAgentExecutor("frontend-dev");
    console.log(`   Agent ID: ${agent.id}`);
    console.log(`   角色: ${agent.role}`);
    console.log(`   技能: ${agent.skills.join(", ")}`);
    console.log("");

    // 执行任务
    console.log("⚡ 开始执行任务...");
    console.log("   (这将调用真实的 Anthropic API)");
    console.log("");

    const startTime = Date.now();
    const result = await agent.execute(task, context, {
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 4000,
    });
    const duration = Date.now() - startTime;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");

    if (result.success) {
      console.log("✅ 任务执行成功！");
      console.log("");
      console.log("📊 执行统计:");
      console.log(`   耗时: ${duration}ms`);
      if (result.metadata) {
        console.log(`   模型: ${result.metadata.model}`);
        console.log(`   输入 tokens: ${result.metadata.inputTokens}`);
        console.log(`   输出 tokens: ${result.metadata.outputTokens}`);
        console.log(`   停止原因: ${result.metadata.stopReason}`);
      }
      console.log("");

      console.log("💬 Agent 响应:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(result.output);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("");

      if (result.nextSteps && result.nextSteps.length > 0) {
        console.log("📝 下一步建议:");
        result.nextSteps.forEach((step, i) => {
          console.log(`   ${i + 1}. ${step}`);
        });
        console.log("");
      }

      console.log("🎉 测试完成！Agent 执行功能正常工作。");
    } else {
      console.log("❌ 任务执行失败");
      console.log("");
      console.log("错误信息:");
      console.log(result.output);
    }
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
    console.error("");
    console.error("请确保:");
    console.error("  1. 已设置 ANTHROPIC_API_KEY 环境变量");
    console.error("  2. 或运行 'npm run config set-api-key' 设置 API Key");
    console.error("  3. API Key 有效且有足够的额度");
    process.exit(1);
  }
}

testAgentExecution().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
