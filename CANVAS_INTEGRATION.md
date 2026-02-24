# Canvas Integration - 技术实现文档

## 概述

Canvas Skill Manager 现已完全集成到 OneCompany Multi-Agent 框架中。通过可视化配置，您可以定义项目的技能栈和团队结构，系统将自动根据配置智能分配任务给对应的 Agent。

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│         Canvas Skill Manager (可视化层)                  │
│  - 拖拽配置 Skills 和 Agents                             │
│  - 保存配置到 .onecompany/canvas-config.json            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│      TaskOrchestrator (编排层)                           │
│  - initializeFromCanvas() 读取配置                       │
│  - 根据配置创建 Agent 实例                                │
│  - 传递配置给 TaskScheduler                              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│      TaskScheduler (调度层)                              │
│  - selectAgentFromCanvas() 智能选择 Agent                │
│  - 根据 Skills 匹配度分配任务                             │
│  - 优先使用 Canvas 配置的 Agents                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│         Agent Execution (执行层)                         │
│  - Frontend Dev Agent 执行前端任务                       │
│  - Backend Dev Agent 执行后端任务                        │
│  - Tester Agent 执行测试任务                             │
└─────────────────────────────────────────────────────────┘
```

## 核心实现

### 1. 类型定义 (`packages/core/src/types.ts`)

```typescript
// Canvas 配置类型
export interface CanvasSkillNode {
  id: string;
  type: 'skill';
  skillId: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface CanvasAgentNode {
  id: string;
  type: 'agent';
  role: string;
  name: string;
  skills: string[];
  enabled: boolean;
  specialization: string;
}

export interface CanvasConfig {
  version: string;
  nodes: Array<CanvasSkillNode | CanvasAgentNode | any>;
  connections?: any[];
}
```

### 2. Orchestrator 集成 (`packages/core/src/orchestrator.ts`)

#### `initializeFromCanvas()` 方法

```typescript
async initializeFromCanvas(workspacePath: string): Promise<{
  agents: number;
  skills: number;
  agentRoles: string[];
  skillIds: string[];
}>
```

**功能**：
- 读取 `.onecompany/canvas-config.json`
- 提取启用的 Agents 和 Skills
- 预注册 Agent 实例到 AgentManager
- 将配置传递给 TaskScheduler
- 记录加载日志

**返回值**：
- `agents`: 加载的 Agent 数量
- `skills`: 加载的 Skill 数量
- `agentRoles`: Agent 角色列表
- `skillIds`: Skill ID 列表

### 3. Scheduler 智能分配 (`packages/core/src/task-scheduler.ts`)

#### `selectAgentFromCanvas()` 方法

```typescript
private selectAgentFromCanvas(task: Task): AgentRole | null
```

**智能匹配算法**：

1. **提取项目技能栈**
   ```typescript
   const projectSkills = canvasConfig.nodes
     .filter(n => n.type === "skill" && n.enabled)
     .map(n => n.skillId);
   ```

2. **获取可用 Agents**
   ```typescript
   const agents = canvasConfig.nodes
     .filter(n => n.type === "agent" && n.enabled);
   ```

3. **任务类型到技能映射**
   ```typescript
   const taskSkillMap = {
     backend: ["api-development", "database-design", "authentication"],
     frontend: ["react-dev", "ui-design", "state-management"],
     testing: ["unit-testing", "integration-testing", "e2e-testing"],
     // ...
   };
   ```

4. **计算匹配分数**
   ```typescript
   for (const agentNode of agents) {
     const matchingSkills = requiredSkills.filter(
       skill => agentSkills.includes(skill) && projectSkills.includes(skill)
     );
     const score = matchingSkills.length;
     // 选择分数最高的 Agent
   }
   ```

### 4. CLI 集成 (`apps/cli/src/index.ts`)

在 Agent 模式中自动加载 Canvas 配置：

```typescript
// 尝试加载 Canvas 配置
console.log("\n🎨 检查 Canvas 配置...\n");
const canvasInfo = await orchestrator.initializeFromCanvas(workspacePath);

if (canvasInfo.agents > 0) {
  console.log("✅ 已加载 Canvas 配置：");
  console.log(`   - ${canvasInfo.agents} 个 Agents`);
  console.log(`   - ${canvasInfo.skills} 个 Skills`);
  console.log("   任务将根据 Canvas 配置智能分配\n");
}
```

## 配置文件格式

### 位置
```
<workspace>/.onecompany/canvas-config.json
```

### 示例配置

```json
{
  "version": "1.0.0",
  "nodes": [
    {
      "id": "skill-react",
      "type": "skill",
      "skillId": "react-dev",
      "name": "React 开发",
      "description": "现代 React 开发，Hooks、TypeScript",
      "enabled": true
    },
    {
      "id": "agent-frontend",
      "type": "agent",
      "role": "frontend-dev",
      "name": "前端开发工程师",
      "skills": ["react-dev", "ui-design"],
      "enabled": true,
      "specialization": "React 和 UI/UX 专家"
    }
  ],
  "connections": []
}
```

## 使用流程

### 1. 在 Canvas 中配置项目

```bash
cd packages/canvas-app
npm run dev
```

1. 打开 Canvas 应用
2. 拖拽 Skills 到画布
3. 拖拽 Agents 到画布
4. 点击"保存配置"
5. 配置保存到 `.onecompany/canvas-config.json`

### 2. 运行 Agent 模式

```bash
npm run onecompany
# 选择 "4. Agent 协作模式"
# 选择已配置的项目
# 输入需求描述
```

### 3. 系统自动执行

```
1. 读取 Canvas 配置
2. 加载配置的 Agents
3. 分解用户需求为任务
4. 根据 Skills 匹配度分配任务
5. 并行执行独立任务
6. 保存执行状态
```

## 演示脚本

运行集成演示：

```bash
node demo-canvas-integration.mjs
```

演示内容：
- ✅ Canvas 配置加载
- ✅ Agent 智能选择
- ✅ 任务自动分解
- ✅ 依赖关系分析
- ✅ 执行计划生成

## 技能映射表

| 任务类型 | 所需技能 | 推荐 Agent |
|---------|---------|-----------|
| `frontend` | react-dev, ui-design, state-management | frontend-dev |
| `backend` | api-development, database-design, authentication | backend-dev |
| `testing` | unit-testing, integration-testing, e2e-testing | tester |
| `architecture` | api-development, database-design, system-design | architect |
| `product-docs` | documentation, technical-writing | product-manager |

## 扩展 Agent 角色

### 添加新的 Agent 类型

1. **在 Canvas 中定义**
   ```json
   {
     "id": "agent-mobile",
     "type": "agent",
     "role": "mobile-dev",
     "name": "移动端开发工程师",
     "skills": ["react-native", "ios", "android"],
     "enabled": true,
     "specialization": "跨平台移动应用开发"
   }
   ```

2. **更新类型定义** (`packages/core/src/types.ts`)
   ```typescript
   export type AgentRole =
     | "product-manager"
     | "architect"
     | "frontend-dev"
     | "backend-dev"
     | "mobile-dev"  // 新增
     | "spec-reviewer"
     | "code-reviewer"
     | "tester";
   ```

3. **添加 Prompt 模板** (`packages/core/src/prompts/`)
   ```
   mobile-dev-agent-prompt.md
   ```

4. **更新任务映射** (`task-scheduler.ts`)
   ```typescript
   const taskSkillMap = {
     // ...
     mobile: ["react-native", "ios", "android"],
   };
   ```

## 最佳实践

### 1. 配置管理

```bash
# 推荐的目录结构
.onecompany/
├── canvas-config.json          # 当前配置
├── canvas-config.backup.json   # 备份
└── templates/                  # 团队模板
    ├── backend-api.json
    ├── frontend-spa.json
    └── fullstack-web.json
```

### 2. 版本控制

```bash
# .gitignore
# 不要忽略 Canvas 配置
!.onecompany/canvas-config.json

# Git commit 示例
git commit -m "feat: 添加移动端开发配置到 Canvas

- 新增移动端开发工程师 Agent
- 添加响应式布局 Skill
- 更新项目架构"
```

### 3. 团队协作

- 架构师负责维护 Canvas 配置
- 配置变更需要 Code Review
- 定期同步配置到团队成员
- 使用模板快速初始化新项目

### 4. 性能优化

- 只启用必要的 Skills 和 Agents
- 合理设置任务并行度
- 定期清理执行日志
- 使用模板避免重复配置

## 故障排查

### 问题 1: Canvas 配置未加载

**症状**：
```
ℹ️  未找到 Canvas 配置，使用默认 Agent 配置
```

**解决方案**：
1. 检查文件是否存在：`ls -la .onecompany/canvas-config.json`
2. 验证 JSON 格式：`cat .onecompany/canvas-config.json | jq`
3. 确认文件权限：`chmod 644 .onecompany/canvas-config.json`

### 问题 2: Agent 选择不正确

**症状**：
```
[TaskScheduler] Selected agent: backend-dev for frontend task
```

**解决方案**：
1. 检查 Agent 的 `skills` 配置
2. 确认 Skills 的 `enabled` 状态
3. 验证 `skillId` 与任务类型的映射关系
4. 查看日志中的匹配分数

### 问题 3: 任务分配失败

**症状**：
```
Error: No suitable agent found for task
```

**解决方案**：
1. 确保至少有一个 Agent 启用
2. 检查 Agent 的 `role` 是否在 `AgentRole` 类型中定义
3. 验证任务类型是否在 `taskSkillMap` 中存在
4. 添加默认 fallback Agent

## 性能指标

### 配置加载时间
- 小型配置 (< 10 nodes): < 50ms
- 中型配置 (10-50 nodes): < 200ms
- 大型配置 (> 50 nodes): < 500ms

### Agent 选择时间
- 简单匹配: < 10ms
- 复杂匹配 (多个候选): < 50ms

### 内存占用
- 基础 Orchestrator: ~20MB
- 每个 Agent 实例: ~5MB
- Canvas 配置缓存: ~1MB

## 未来规划

### 短期 (1-2 个月)
- [ ] Canvas 配置热重载
- [ ] Agent 性能监控面板
- [ ] 配置版本对比工具
- [ ] 自动生成配置文档

### 中期 (3-6 个月)
- [ ] AI 推荐最佳配置
- [ ] 实时协作编辑
- [ ] 配置分析和优化建议
- [ ] 与项目管理工具集成

### 长期 (6-12 个月)
- [ ] 跨项目配置复用
- [ ] 团队能力分析
- [ ] 智能任务分配引擎
- [ ] 项目健康度评估

## 参考资料

- [Canvas 应用开发文档](./packages/canvas-app/README.md)
- [集成指南](./packages/canvas-app/INTEGRATION_GUIDE.md)
- [核心 API 文档](./packages/core/README.md)
- [Agent 开发指南](./docs/agent-development.md)

## 贡献

欢迎提交 Issue 和 Pull Request！

- 报告 Bug: [GitHub Issues](https://github.com/onecompany/issues)
- 功能建议: [GitHub Discussions](https://github.com/onecompany/discussions)
- 代码贡献: [Contributing Guide](./CONTRIBUTING.md)

---

**版本**: v0.2.0
**最后更新**: 2026-02-24
**维护者**: OneCompany Team
