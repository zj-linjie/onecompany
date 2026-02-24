# Canvas Skill Manager 更新方案 & Agent Factory 集成

## 背景

经过真实 Agent 执行的实现，我们需要：
1. Canvas 显示真实的 Skills 和 Agents
2. 实现 Skills 和 Agents 的 CRUD 操作
3. 定义 Agent 的来源和存储方式

## 当前状态

### ✅ Skills 已完成
- **来源**: `/Users/apple/dev/skill-factory` (917 个真实 Skills)
- **加载**: `skills-loader.ts` 自动扫描和加载
- **Canvas**: 已更新使用 `skills-generated.json`
- **CRUD**: CLI 工具支持增删改查

### ⚠️ Agents 需要同步
- **定义**: 分散在多个文件中
- **来源**: 硬编码在代码中
- **Canvas**: 使用旧的定义（10个，与实际不符）
- **实际可用**: 9 个真实 Agent 角色

## 方案：Agent Factory 集成

### 设计理念

参考 skill-factory 的成功模式，创建 agent-factory：

```
/Users/apple/dev/agent-factory/
├── product-manager/
│   ├── AGENT.md          # Agent 定义
│   ├── prompt.md         # Agent prompt 模板
│   └── config.json       # Agent 配置
├── architect/
│   ├── AGENT.md
│   ├── prompt.md
│   └── config.json
├── frontend-dev/
├── backend-dev/
├── fullstack-dev/
├── devops/
├── tester/
├── spec-reviewer/
└── code-reviewer/
```

### Agent 定义格式 (AGENT.md)

```markdown
---
id: frontend-dev
role: frontend-dev
name: 前端开发工程师
nameEn: Frontend Developer
category: development
icon: 🎨
color: #10b981
---

# 前端开发工程师

## 专长
前端开发和 UI 实现专家

## 描述
负责前端开发、UI 实现、用户交互和前端性能优化。精通 React、Vue 等现代前端框架。

## 默认技能
- canvas-design
- artifacts-builder

## 推荐场景
- 前端开发
- UI 实现
- 组件开发
- 前端优化

## Prompt 模板
使用 `prompt.md` 文件中的模板
```

### Agent 配置格式 (config.json)

```json
{
  "id": "frontend-dev",
  "role": "frontend-dev",
  "enabled": true,
  "model": "claude-sonnet-4-5-20250929",
  "maxTokens": 8000,
  "temperature": 0.7,
  "skills": ["canvas-design", "artifacts-builder"],
  "capabilities": {
    "codeGeneration": true,
    "codeReview": false,
    "testing": true,
    "documentation": true
  }
}
```

## 实现计划

### Phase 1: Agent Factory 基础结构 ✅

**目标**: 创建 agent-factory 目录结构和基础 Agent 定义

**任务**:
1. 创建 `/Users/apple/dev/agent-factory` 目录
2. 为 9 个 Agent 创建子目录
3. 编写 AGENT.md 定义文件
4. 编写 prompt.md 模板文件
5. 编写 config.json 配置文件

**文件清单**:
```
agent-factory/
├── README.md
├── product-manager/
│   ├── AGENT.md
│   ├── prompt.md
│   └── config.json
├── architect/
├── frontend-dev/
├── backend-dev/
├── fullstack-dev/
├── devops/
├── tester/
├── spec-reviewer/
└── code-reviewer/
```

### Phase 2: Agent Loader 实现

**目标**: 创建 agents-loader.ts 加载 agent-factory

**文件**: `packages/core/src/agents-loader.ts`

**功能**:
```typescript
// 加载所有 Agents
export async function loadAgentsFromFactory(factoryPath: string): Promise<AgentsLoadResult>

// 搜索 Agents
export function searchAgents(allAgents: AgentMetadata[], query: string): AgentMetadata[]

// 获取推荐的 Agents
export function getRecommendedAgents(allAgents: AgentMetadata[], projectType: string): AgentMetadata[]
```

**类似于 skills-loader.ts 的实现**:
- 递归扫描 agent-factory 目录
- 解析 AGENT.md 的 frontmatter
- 加载 prompt.md 和 config.json
- 返回完整的 Agent 元数据

### Phase 3: 生成 Canvas Agents 数据

**目标**: 创建 generate-canvas-agents 脚本

**文件**: `apps/generate-canvas-agents/index.mjs`

**功能**:
```bash
npm run generate-agents
```

**输出**: `packages/canvas-app/src/data/agents-generated.json`

**格式**:
```json
{
  "version": "1.0.0",
  "generatedAt": "2025-02-24T...",
  "totalAgents": 9,
  "agents": [...],
  "categories": ["development", "review", "management"],
  "byCategory": {...}
}
```

### Phase 4: 更新 Canvas 使用真实 Agents

**目标**: Canvas 显示和管理真实的 Agents

**文件**: `packages/canvas-app/src/data/agents.ts`

**更新**:
```typescript
import agentsGenerated from './agents-generated.json';

export const agentsData: Agent[] = agentsGenerated.agents.map(...);
```

**新增功能**:
- 显示 9 个真实可用的 Agents
- 显示 Agent 的实际配置（model, maxTokens 等）
- 显示 Agent 的 capabilities

### Phase 5: Canvas CRUD 功能实现

**目标**: 在 Canvas 中实现 Skills 和 Agents 的增删改查

**新增组件**:

1. **SkillsPanel.tsx** - Skills 管理面板
   - 搜索 Skills（917 个）
   - 按类别筛选
   - 拖拽添加到画布
   - 查看 Skill 详情

2. **AgentsPanel.tsx** - Agents 管理面板
   - 显示 9 个可用 Agents
   - 按类别筛选
   - 拖拽添加到画布
   - 查看 Agent 详情

3. **NodeEditor.tsx** - 节点编辑器
   - 编辑 Skill 配置
   - 编辑 Agent 配置
   - 启用/禁用节点
   - 删除节点

4. **ConfigSync.tsx** - 配置同步
   - 保存到 .onecompany/canvas-config.json
   - 从配置文件加载
   - 实时同步

**操作流程**:
```
1. 用户在 Canvas 中搜索 Skill/Agent
2. 拖拽到画布
3. 点击节点编辑配置
4. 保存配置到项目
5. CLI 读取配置执行任务
```

### Phase 6: CLI 工具更新

**目标**: CLI 工具使用 agent-factory

**更新文件**:
- `apps/canvas-config-cli/index.mjs`
- `apps/canvas-config-cli/ai-suggest.mjs`

**新增命令**:
```bash
npm run agents list              # 列出所有 Agents
npm run agents search <keyword>  # 搜索 Agents
npm run agents info <agent-id>   # 查看 Agent 详情
npm run agents config            # 查看 agent-factory 配置
```

### Phase 7: 配置管理更新

**目标**: 统一管理 skill-factory 和 agent-factory 路径

**文件**: `~/.onecompany/config.json`

**更新配置**:
```json
{
  "skillFactoryPath": "/Users/apple/dev/skill-factory",
  "agentFactoryPath": "/Users/apple/dev/agent-factory",
  "anthropicApiKey": "...",
  "version": "0.1.0"
}
```

**新增命令**:
```bash
npm run config set-agent-factory <path>
npm run config show  # 显示两个 factory 路径
```

## Agent 来源定义讨论

### 方案对比

#### 方案 A: Agent Factory（推荐）✅

**优点**:
- ✅ 与 skill-factory 一致的设计
- ✅ 易于扩展和维护
- ✅ 支持自定义 Agent
- ✅ Prompt 模板可独立管理
- ✅ 配置灵活（model, tokens, temperature）

**缺点**:
- ⚠️ 需要创建目录结构
- ⚠️ 需要编写 AGENT.md 文件

**适用场景**:
- 需要频繁添加新 Agent
- 需要自定义 Agent 行为
- 团队协作开发

#### 方案 B: 代码硬编码

**优点**:
- ✅ 简单直接
- ✅ 无需额外文件

**缺点**:
- ❌ 难以扩展
- ❌ 修改需要重新编译
- ❌ 不支持自定义 Agent

**适用场景**:
- Agent 数量固定
- 不需要自定义

#### 方案 C: 数据库存储

**优点**:
- ✅ 动态管理
- ✅ 支持在线编辑

**缺点**:
- ❌ 需要数据库
- ❌ 复杂度高
- ❌ 不适合本地开发

### 推荐方案：Agent Factory

**理由**:
1. **一致性**: 与 skill-factory 设计一致
2. **可扩展**: 易于添加新 Agent
3. **灵活性**: 支持自定义配置
4. **版本控制**: 可以用 Git 管理
5. **团队协作**: 多人可以贡献 Agent

### Agent Factory 目录结构

```
/Users/apple/dev/agent-factory/
├── README.md                    # Agent Factory 说明
├── CONTRIBUTING.md              # 贡献指南
├── .gitignore
│
├── core/                        # 核心 Agents（必需）
│   ├── product-manager/
│   ├── architect/
│   ├── frontend-dev/
│   ├── backend-dev/
│   ├── fullstack-dev/
│   ├── devops/
│   ├── tester/
│   ├── spec-reviewer/
│   └── code-reviewer/
│
├── specialized/                 # 专业化 Agents（可选）
│   ├── mobile-dev/
│   ├── data-engineer/
│   ├── security-expert/
│   └── performance-optimizer/
│
└── custom/                      # 自定义 Agents（用户添加）
    └── my-custom-agent/
```

### Agent 定义标准

**必需字段**:
- `id`: Agent 唯一标识
- `role`: Agent 角色（对应 AgentRole 类型）
- `name`: 中文名称
- `nameEn`: 英文名称
- `category`: 类别（development/review/management）

**可选字段**:
- `icon`: 图标 emoji
- `color`: 主题颜色
- `model`: 默认使用的模型
- `maxTokens`: 最大 token 数
- `temperature`: 温度参数
- `skills`: 默认技能列表
- `capabilities`: 能力标记

## 实现优先级

### 立即实现（本次）:
1. ✅ 修复 AgentRole 类型定义
2. ✅ 创建 agents-definition.ts
3. ⏳ 提交当前更改

### 下一步实现:
1. 创建 agent-factory 目录结构
2. 编写 9 个 Agent 的定义文件
3. 实现 agents-loader.ts
4. 创建 generate-canvas-agents 脚本
5. 更新 Canvas 使用真实 Agents

### 后续优化:
1. Canvas CRUD 功能
2. Agent 配置编辑器
3. 自定义 Agent 支持
4. Agent 性能监控

## 总结

**Skills 和 Agents 的统一管理**:

```
/Users/apple/dev/
├── skill-factory/          # 917 个 Skills
│   ├── superpowers/
│   ├── awesome-claude-skills/
│   └── codex/
│
└── agent-factory/          # 9+ 个 Agents
    ├── core/               # 核心 Agents
    ├── specialized/        # 专业 Agents
    └── custom/             # 自定义 Agents
```

**工作流程**:
```
1. 开发者在 agent-factory 添加/修改 Agent
2. 运行 npm run generate-agents
3. Canvas 自动显示最新的 Agents
4. 用户在 Canvas 中配置项目
5. CLI 读取配置并执行
6. Agent 使用真实的 Anthropic API 执行任务
```

**下一步行动**:
1. 提交当前代码
2. 创建 agent-factory 目录
3. 实现 agents-loader
4. 更新 Canvas

是否开始实现 agent-factory？
