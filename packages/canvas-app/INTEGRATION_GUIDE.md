# Canvas Skill Manager 融入项目开发的方案

## 🎯 核心理念

Canvas Skill Manager 不仅是一个可视化工具，更是一个**项目配置中心**和**团队协作枢纽**。它将抽象的技能和专家概念具象化，帮助团队更好地规划和执行项目。

---

## 💡 融入方式

### 方案 1: 作为项目初始化工具 ⭐⭐⭐⭐⭐

**使用场景**: 新项目启动时

**工作流程**:
```
1. 项目经理/架构师打开 Canvas Skill Manager
2. 选择合适的模板（全栈 Web、前端 SPA、后端 API 等）
3. 根据项目需求调整 Skills 和 Agents
4. 保存配置到项目根目录 `.onecompany/canvas-config.json`
5. 配置文件提交到 Git，成为项目的一部分
```

**实际应用**:
```bash
# 项目结构
my-project/
├── .onecompany/
│   └── canvas-config.json          # Canvas 配置
├── src/
├── package.json
└── README.md
```

**配置文件的作用**:
- 📋 **技术栈文档**: 清晰展示项目使用的技术
- 👥 **团队配置**: 定义需要哪些角色的开发者
- 🎯 **技能要求**: 明确项目需要的技能集
- 🔄 **版本控制**: 随项目演进更新配置

---

### 方案 2: 与 OneCompany Multi-Agent 框架集成 ⭐⭐⭐⭐⭐

**核心思路**: Canvas 配置驱动 Agent 执行

**集成架构**:
```
┌─────────────────────────────────────────────────┐
│         Canvas Skill Manager (可视化层)          │
│  - 拖拽配置 Skills 和 Agents                     │
│  - 保存配置到 canvas-config.json                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│      OneCompany Orchestrator (编排层)           │
│  - 读取 canvas-config.json                       │
│  - 根据配置创建 Agent 实例                        │
│  - 分配任务给对应的 Agents                       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         Agent Execution (执行层)                 │
│  - Backend Dev Agent 执行后端任务                │
│  - Frontend Dev Agent 执行前端任务               │
│  - DevOps Agent 执行部署任务                     │
└─────────────────────────────────────────────────┘
```

**实现步骤**:

#### Step 1: 扩展 Orchestrator 读取 Canvas 配置

```typescript
// packages/core/src/orchestrator.ts

import { readFile } from 'fs/promises';
import path from 'path';

export class TaskOrchestrator {
  /**
   * 从 Canvas 配置初始化 Agents
   */
  async initializeFromCanvas(workspacePath: string): Promise<void> {
    const configPath = path.join(workspacePath, '.onecompany/canvas-config.json');

    try {
      const configData = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);

      // 提取启用的 Agents
      const enabledAgents = config.nodes.filter(
        (node: any) => node.type === 'agent' && node.enabled
      );

      // 为每个 Agent 创建执行器
      for (const agentNode of enabledAgents) {
        const agent = createAgentExecutor(agentNode.role);
        this.agentManager.registerAgent(agent);

        console.log(`✅ 已加载 Agent: ${agentNode.name} (${agentNode.role})`);
      }

      // 提取启用的 Skills
      const enabledSkills = config.nodes.filter(
        (node: any) => node.type === 'skill' && node.enabled
      );

      console.log(`📦 项目技能栈: ${enabledSkills.map((s: any) => s.name).join(', ')}`);

    } catch (error) {
      console.warn('未找到 Canvas 配置，使用默认 Agents');
    }
  }
}
```

#### Step 2: 根据 Skills 智能分配任务

```typescript
// packages/core/src/task-scheduler.ts

export class TaskScheduler {
  /**
   * 根据 Canvas 配置的 Skills 选择最佳 Agent
   */
  selectAgentForTask(task: Task, canvasConfig: any): Agent | null {
    // 获取项目启用的 Skills
    const projectSkills = canvasConfig.nodes
      .filter((n: any) => n.type === 'skill' && n.enabled)
      .map((n: any) => n.skillId);

    // 获取可用的 Agents 及其 Skills
    const agents = canvasConfig.nodes
      .filter((n: any) => n.type === 'agent' && n.enabled);

    // 根据任务类型和 Agent 的 Skills 匹配
    for (const agentNode of agents) {
      const agentSkills = agentNode.skills || [];

      // 检查 Agent 是否具备任务所需的技能
      if (this.isAgentSuitable(task, agentSkills, projectSkills)) {
        return this.agentManager.getAgent(agentNode.role);
      }
    }

    return null;
  }

  private isAgentSuitable(
    task: Task,
    agentSkills: string[],
    projectSkills: string[]
  ): boolean {
    // 任务类型映射到所需技能
    const taskSkillMap: Record<string, string[]> = {
      'backend': ['api-development', 'database-design', 'authentication'],
      'frontend': ['react-dev', 'ui-design', 'state-management'],
      'testing': ['unit-testing', 'integration-testing', 'e2e-testing'],
    };

    const requiredSkills = taskSkillMap[task.type] || [];

    // 检查 Agent 是否具备所需技能
    return requiredSkills.some(skill =>
      agentSkills.includes(skill) && projectSkills.includes(skill)
    );
  }
}
```

#### Step 3: CLI 集成

```typescript
// apps/cli/src/index.ts

async function runAgentMode(): Promise<void> {
  console.log("\n🤖 === Agent 协作模式 ===\n");

  // 创建 Orchestrator
  const orchestrator = new TaskOrchestrator({
    maxParallelTasks: 2,
    enableReview: false,
    enablePersistence: true,
  });

  // 从 Canvas 配置初始化
  await orchestrator.initializeFromCanvas(workspacePath);

  // 显示加载的配置
  console.log("\n📋 已加载 Canvas 配置：");
  console.log("  - 3 个 Agents");
  console.log("  - 5 个 Skills");

  // 获取用户需求
  const userInput = await prompt("需求描述");

  // 分解任务
  const tasks = await orchestrator.decomposeTask(userInput, context);

  // 根据 Canvas 配置分配任务
  for (const task of tasks) {
    const agent = orchestrator.selectAgentForTask(task);
    console.log(`📌 任务 "${task.title}" 分配给 ${agent?.role}`);
  }

  // 执行任务
  await orchestrator.executeAll(context);
}
```

---

### 方案 3: 作为团队协作工具 ⭐⭐⭐⭐

**使用场景**: 团队成员了解项目配置

**工作流程**:
```
1. 新成员加入项目
2. 打开 Canvas Skill Manager
3. 加载项目的 canvas-config.json
4. 可视化查看：
   - 项目使用的技术栈
   - 团队角色分工
   - 技能要求
5. 了解自己应该负责的部分
```

**实际价值**:
- 📚 **快速上手**: 新成员快速了解项目
- 🎯 **明确分工**: 清楚知道谁负责什么
- 📊 **技能可视化**: 直观展示技术栈
- 🔄 **保持同步**: 配置变更所有人可见

---

### 方案 4: 作为项目文档生成器 ⭐⭐⭐

**核心思路**: 从 Canvas 配置自动生成项目文档

**实现示例**:

```typescript
// packages/canvas-app/src/utils/doc-generator.ts

export function generateProjectDoc(config: CanvasConfig): string {
  const skills = config.nodes.filter(n => n.type === 'skill' && n.enabled);
  const agents = config.nodes.filter(n => n.type === 'agent' && n.enabled);

  return `
# ${config.project.name} - 项目配置

## 技术栈

${skills.map(s => `- **${s.name}**: ${s.description}`).join('\n')}

## 团队配置

${agents.map(a => `
### ${a.name}
- **角色**: ${a.role}
- **专长**: ${a.specialization}
- **技能**: ${a.skills.join(', ')}
`).join('\n')}

## 项目架构

\`\`\`
${generateArchitectureDiagram(config)}
\`\`\`

---
*此文档由 Canvas Skill Manager 自动生成*
`;
}
```

**使用方式**:
```bash
# 在 Canvas 中点击 "导出文档" 按钮
# 自动生成 PROJECT_ARCHITECTURE.md
```

---

### 方案 5: 与 CI/CD 集成 ⭐⭐⭐

**核心思路**: 根据 Canvas 配置自动化部署流程

**实现示例**:

```yaml
# .github/workflows/deploy.yml

name: Deploy
on: [push]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      # 读取 Canvas 配置
      - name: Parse Canvas Config
        id: canvas
        run: |
          AGENTS=$(jq -r '.nodes[] | select(.type=="agent" and .enabled==true) | .role' .onecompany/canvas-config.json)
          echo "agents=$AGENTS" >> $GITHUB_OUTPUT

      # 根据配置决定运行哪些任务
      - name: Run Backend Tests
        if: contains(steps.canvas.outputs.agents, 'backend-dev')
        run: npm run test:backend

      - name: Run Frontend Tests
        if: contains(steps.canvas.outputs.agents, 'frontend-dev')
        run: npm run test:frontend

      - name: Deploy
        if: contains(steps.canvas.outputs.agents, 'devops')
        run: npm run deploy
```

---

## 🔄 完整的开发流程示例

### 场景: 开发一个全栈 Web 应用

#### 1. 项目初始化阶段

```bash
# 架构师操作
1. 打开 Canvas Skill Manager
2. 点击 "📋 加载模板"
3. 选择 "全栈 Web 应用" 模板
4. 调整配置：
   - 添加 "GraphQL" Skill
   - 添加 "性能优化专家" Agent
5. 点击 "保存配置"
6. 配置保存到 .onecompany/canvas-config.json
7. 提交到 Git
```

#### 2. 团队协作阶段

```bash
# 后端开发者
1. git clone 项目
2. 打开 Canvas Skill Manager
3. 加载 canvas-config.json
4. 看到自己负责：API 开发、数据库设计、身份认证
5. 开始开发

# 前端开发者
1. git clone 项目
2. 打开 Canvas Skill Manager
3. 加载 canvas-config.json
4. 看到自己负责：React 开发、UI 设计、状态管理
5. 开始开发
```

#### 3. Agent 自动化阶段

```bash
# 使用 OneCompany CLI
npm run onecompany

# 选择 "Agent 协作模式"
# 系统自动：
1. 读取 canvas-config.json
2. 加载配置的 Agents（后端、前端、DevOps）
3. 用户输入需求："实现用户登录功能"
4. 系统分解任务：
   - Task 1: 设计登录 API → 分配给 Backend Dev Agent
   - Task 2: 实现登录表单 → 分配给 Frontend Dev Agent
   - Task 3: 配置 JWT 认证 → 分配给 Backend Dev Agent
5. Agents 并行执行
6. 自动审查和测试
```

#### 4. 配置演进阶段

```bash
# 项目需求变更
1. 需要添加移动端支持
2. 架构师打开 Canvas
3. 添加 "移动端开发工程师" Agent
4. 添加 "响应式布局" Skill
5. 保存配置
6. 提交更新
7. 团队成员拉取最新配置
8. 新的 Agent 自动参与任务分配
```

---

## 📊 实际收益

### 对团队的价值

1. **可视化沟通** 📊
   - 不再需要长篇文档描述技术栈
   - 一张图胜过千言万语
   - 技术和非技术人员都能理解

2. **快速上手** 🚀
   - 新成员 5 分钟了解项目
   - 清晰的角色定位
   - 明确的技能要求

3. **配置即文档** 📚
   - 配置文件就是最新的文档
   - 随代码一起版本控制
   - 永远不会过时

4. **自动化基础** 🤖
   - 为 Agent 自动化提供配置
   - 智能任务分配
   - 减少人工协调

### 对项目的价值

1. **架构清晰** 🏗️
   - 技术栈一目了然
   - 依赖关系可视化
   - 便于架构评审

2. **质量保证** ✅
   - 确保技能覆盖完整
   - 避免技术盲区
   - 团队能力可视化

3. **成本控制** 💰
   - 清楚需要哪些角色
   - 避免人员冗余
   - 优化资源配置

4. **知识传承** 📖
   - 项目配置可复用
   - 最佳实践模板化
   - 经验积累可视化

---

## 🎯 推荐实施路径

### 阶段 1: 试点项目（1-2 周）

- ✅ 选择一个新项目试用
- ✅ 使用模板快速配置
- ✅ 团队成员熟悉工具
- ✅ 收集反馈和改进

### 阶段 2: 团队推广（1 个月）

- ✅ 所有新项目使用 Canvas
- ✅ 建立配置规范
- ✅ 创建团队专属模板
- ✅ 培训团队成员

### 阶段 3: 深度集成（2-3 个月）

- ✅ 与 OneCompany Agent 集成
- ✅ 自动化任务分配
- ✅ CI/CD 集成
- ✅ 文档自动生成

### 阶段 4: 持续优化（持续）

- ✅ 收集使用数据
- ✅ 优化模板库
- ✅ 增强自动化
- ✅ 扩展功能

---

## 💡 最佳实践

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

# Git commit 消息示例
git commit -m "feat: 添加移动端开发配置到 Canvas

- 新增移动端开发工程师 Agent
- 添加响应式布局 Skill
- 更新项目架构图"
```

### 3. 团队协作

```markdown
# 团队规范

## Canvas 配置更新流程

1. 架构师提出配置变更
2. 在 Canvas 中调整配置
3. 保存并导出文档
4. 创建 PR 并附上配置说明
5. 团队 Review
6. 合并后通知所有成员
```

### 4. 文档同步

```bash
# package.json scripts
{
  "scripts": {
    "docs:generate": "node scripts/generate-docs-from-canvas.js",
    "docs:sync": "npm run docs:generate && git add docs/"
  }
}

# 在 pre-commit hook 中自动更新文档
```

---

## 🚀 未来展望

### 短期（1-3 个月）

- [ ] Canvas 配置驱动 Agent 执行
- [ ] 自动生成项目文档
- [ ] 团队模板库
- [ ] 配置对比和合并

### 中期（3-6 个月）

- [ ] AI 推荐最佳配置
- [ ] 实时协作编辑
- [ ] 配置分析和优化建议
- [ ] 与项目管理工具集成

### 长期（6-12 个月）

- [ ] 跨项目配置复用
- [ ] 团队能力分析
- [ ] 智能任务分配引擎
- [ ] 项目健康度评估

---

## 📝 总结

Canvas Skill Manager 不仅仅是一个可视化工具，它是：

1. **项目配置中心** - 定义项目的技术栈和团队结构
2. **团队协作枢纽** - 帮助团队成员理解项目和分工
3. **自动化基础** - 为 Agent 系统提供配置驱动
4. **知识管理工具** - 积累和传承项目经验

通过将 Canvas 深度集成到开发流程中，可以：
- ✅ 提升团队协作效率
- ✅ 降低项目管理成本
- ✅ 加速新成员上手
- ✅ 实现智能自动化

**关键是**: 让 Canvas 配置成为项目的"DNA"，驱动整个开发流程。

---

**下一步行动**:
1. 选择一个试点项目
2. 使用 Canvas 创建配置
3. 集成到 OneCompany Agent 系统
4. 收集反馈并迭代优化
