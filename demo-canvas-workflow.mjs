#!/usr/bin/env node

/**
 * Canvas Skill Manager 需求演示
 * 展示 OneCompany 如何自动分解复杂需求
 */

console.log("\n🤖 === OneCompany Multi-Agent 框架演示 ===\n");
console.log("需求：Canvas Skill & Agent 管理系统\n");

// 模拟 PM Agent 分析后的任务分解结果
const tasks = [
  {
    id: "task-1",
    title: "设计系统架构和数据模型",
    description: "设计 Canvas 应用的整体架构，包括前端组件结构、状态管理方案、数据流设计。定义 SkillNode、AgentNode、ProjectNode、Connection 等核心数据模型。",
    type: "architecture",
    status: "ready",
    dependencies: [],
    priority: 10,
  },
  {
    id: "task-2",
    title: "搭建 React + TypeScript 项目基础",
    description: "创建 packages/canvas-app 项目，配置 React 18、TypeScript、Vite。集成 Tailwind CSS 和 shadcn/ui。设置项目结构和基础配置。",
    type: "frontend",
    status: "ready",
    dependencies: [],
    priority: 9,
  },
  {
    id: "task-3",
    title: "集成 React Flow 实现画布系统",
    description: "集成 React Flow 库，实现无限画布、缩放、平移功能。添加网格背景和基础交互。创建 Canvas 主组件。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-1", "task-2"],
    priority: 8,
  },
  {
    id: "task-4",
    title: "实现 Skill 节点组件",
    description: "创建 SkillNode 组件，显示图标、名称、描述、启用/禁用状态。实现节点拖拽、点击切换状态、右键菜单等交互功能。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-3"],
    priority: 7,
  },
  {
    id: "task-5",
    title: "实现 Agent 节点组件",
    description: "创建 AgentNode 组件，显示角色、技能列表、专家领域。实现与 Skill 节点类似的交互功能。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-3"],
    priority: 7,
  },
  {
    id: "task-6",
    title: "实现项目节点组件",
    description: "创建 ProjectNode 组件作为中心节点，显示项目信息和连接状态。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-3"],
    priority: 7,
  },
  {
    id: "task-7",
    title: "实现连接线系统",
    description: "使用 React Flow 的 Edge 功能实现连接线。支持不同类型连接（skill-to-project、agent-to-project、skill-to-agent）。添加连接动画和颜色区分。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-4", "task-5", "task-6"],
    priority: 6,
  },
  {
    id: "task-8",
    title: "实现 Skills Catalog 侧边栏",
    description: "创建左侧 Skills Catalog 面板，从 @onecompany/skills-catalog 读取数据。实现分类展示、搜索过滤、拖拽到画布功能。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-4"],
    priority: 6,
  },
  {
    id: "task-9",
    title: "实现 Agent Library 侧边栏",
    description: "创建右侧 Agent Library 面板，显示可用 Agents。实现拖拽到画布加载 Agent 功能。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-5"],
    priority: 6,
  },
  {
    id: "task-10",
    title: "实现状态管理（Zustand）",
    description: "使用 Zustand 创建全局状态管理，管理画布节点、连接、配置等状态。实现状态持久化到 localStorage。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-1"],
    priority: 5,
  },
  {
    id: "task-11",
    title: "实现配置持久化系统",
    description: "实现配置保存到 .onecompany/canvas-config.json。支持导入/导出配置。集成 @onecompany/core 的状态管理。",
    type: "backend",
    status: "pending",
    dependencies: ["task-10"],
    priority: 5,
  },
  {
    id: "task-12",
    title: "实现配置验证系统",
    description: "创建验证规则，检查 Skill 依赖、Agent 兼容性、循环连接等问题。实时显示验证结果和建议。",
    type: "backend",
    status: "pending",
    dependencies: ["task-11"],
    priority: 4,
  },
  {
    id: "task-13",
    title: "实现节点配置面板",
    description: "创建节点配置弹窗，支持编辑节点属性、查看详情、配置高级选项。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-7"],
    priority: 4,
  },
  {
    id: "task-14",
    title: "添加动画和视觉效果",
    description: "添加拖拽预览、连接动画、状态切换动画等视觉效果。优化用户体验。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-7", "task-13"],
    priority: 3,
  },
  {
    id: "task-15",
    title: "编写单元测试和集成测试",
    description: "使用 Vitest 编写组件测试、状态管理测试、配置验证测试。确保测试覆盖率 > 80%。",
    type: "testing",
    status: "pending",
    dependencies: ["task-12", "task-13"],
    priority: 3,
  },
  {
    id: "task-16",
    title: "性能优化和响应式设计",
    description: "实现虚拟化渲染（处理 100+ 节点）。优化拖拽性能。实现响应式布局（桌面/平板/移动端）。",
    type: "frontend",
    status: "pending",
    dependencies: ["task-14"],
    priority: 2,
  },
];

console.log("📋 PM Agent 分析结果：\n");
console.log(`✅ 成功分解为 ${tasks.length} 个任务\n`);

// 显示任务列表
console.log("📝 任务列表：\n");
tasks.forEach((task, index) => {
  const statusIcon = task.status === "ready" ? "🟢" : "⏸️";
  const typeIcon =
    task.type === "architecture"
      ? "🏗️"
      : task.type === "frontend"
      ? "🎨"
      : task.type === "backend"
      ? "⚙️"
      : task.type === "testing"
      ? "🧪"
      : "📦";
  const depInfo =
    task.dependencies.length > 0
      ? ` (依赖 ${task.dependencies.length} 个任务)`
      : " (可立即执行)";

  console.log(`${index + 1}. ${statusIcon} ${typeIcon} ${task.title}`);
  console.log(`   状态: ${task.status} | 优先级: ${task.priority}${depInfo}`);
  console.log();
});

// 分析依赖关系
console.log("🔗 依赖关系分析：\n");
const readyTasks = tasks.filter((t) => t.status === "ready");
const pendingTasks = tasks.filter((t) => t.status === "pending");

console.log(`✅ 可立即执行: ${readyTasks.length} 个任务`);
readyTasks.forEach((task) => {
  console.log(`   - ${task.title}`);
});

console.log(`\n⏸️  等待依赖: ${pendingTasks.length} 个任务\n`);

// 显示执行计划（按阶段）
console.log("🚀 执行计划（分阶段并行）：\n");

const phases = [
  {
    name: "Phase 1: 基础设施",
    tasks: tasks.filter((t) => t.dependencies.length === 0),
  },
  {
    name: "Phase 2: 画布系统",
    tasks: tasks.filter(
      (t) =>
        t.dependencies.length > 0 &&
        t.dependencies.every((dep) =>
          tasks.find((t2) => t2.id === dep && t2.dependencies.length === 0)
        )
    ),
  },
  {
    name: "Phase 3: 节点组件",
    tasks: tasks.filter(
      (t) =>
        t.dependencies.length > 0 &&
        !t.dependencies.every((dep) =>
          tasks.find((t2) => t2.id === dep && t2.dependencies.length === 0)
        ) &&
        ["task-4", "task-5", "task-6", "task-8", "task-9", "task-10"].includes(
          t.id
        )
    ),
  },
  {
    name: "Phase 4: 连接和配置",
    tasks: tasks.filter((t) =>
      ["task-7", "task-11", "task-12", "task-13"].includes(t.id)
    ),
  },
  {
    name: "Phase 5: 优化和测试",
    tasks: tasks.filter((t) =>
      ["task-14", "task-15", "task-16"].includes(t.id)
    ),
  },
];

phases.forEach((phase, index) => {
  if (phase.tasks.length === 0) return;

  console.log(`\n--- ${phase.name} ---`);
  console.log(`可并行执行 ${phase.tasks.length} 个任务：`);
  phase.tasks.forEach((task) => {
    const typeIcon =
      task.type === "architecture"
        ? "🏗️"
        : task.type === "frontend"
        ? "🎨"
        : task.type === "backend"
        ? "⚙️"
        : task.type === "testing"
        ? "🧪"
        : "📦";
    console.log(`  ${typeIcon} ${task.title}`);
  });
});

// 统计信息
console.log("\n\n📊 统计信息：\n");
const tasksByType = tasks.reduce((acc, task) => {
  acc[task.type] = (acc[task.type] || 0) + 1;
  return acc;
}, {});

console.log("任务类型分布:");
Object.entries(tasksByType).forEach(([type, count]) => {
  const icon =
    type === "architecture"
      ? "🏗️"
      : type === "frontend"
      ? "🎨"
      : type === "backend"
      ? "⚙️"
      : type === "testing"
      ? "🧪"
      : "📦";
  console.log(`  ${icon} ${type}: ${count} 个`);
});

console.log("\n预估时间:");
console.log(`  - 串行执行: ~${tasks.length * 45} 分钟`);
console.log(`  - 并行执行 (3 agents): ~${Math.ceil(tasks.length / 3) * 45} 分钟`);
console.log(`  - 实际时间: ~4-5 周（考虑依赖关系）\n`);

// 关键路径分析
console.log("🎯 关键路径（最长依赖链）：\n");
const criticalPath = [
  "设计系统架构和数据模型",
  "搭建 React + TypeScript 项目基础",
  "集成 React Flow 实现画布系统",
  "实现 Skill 节点组件",
  "实现连接线系统",
  "添加动画和视觉效果",
  "性能优化和响应式设计",
];

criticalPath.forEach((title, index) => {
  console.log(`${index + 1}. ${title}`);
  if (index < criticalPath.length - 1) {
    console.log("   ↓");
  }
});

console.log("\n\n" + "=".repeat(60));
console.log("💡 OneCompany 的优势");
console.log("=".repeat(60));
console.log("\n✅ 自动任务分解 - 从需求文档到可执行任务");
console.log("✅ 智能依赖分析 - 自动识别任务依赖关系");
console.log("✅ 并行执行优化 - 最大化利用多 agent 协作");
console.log("✅ 实时进度追踪 - 保存状态，支持恢复");
console.log("✅ 质量门禁 - 可选的两阶段审查机制\n");

console.log("🚀 下一步：");
console.log("1. 运行 'npm run start' 启动 CLI");
console.log("2. 选择 '4. Agent 协作模式'");
console.log("3. 选择 '2. 从文件读取需求文档'");
console.log("4. 输入: examples/canvas-skill-manager-requirements.md");
console.log("5. 确认执行，观看 agents 自动工作！\n");

console.log("💾 配置将保存到: .onecompany/canvas-config.json");
console.log("📊 执行日志将保存到: .onecompany/execution-log.json\n");

console.log("🎉 演示完成！\n");
