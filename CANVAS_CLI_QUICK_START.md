# Canvas CLI 快速配置指南

## 🚀 快速开始

现在你有 **3 种方式** 配置 Canvas：

### 1️⃣ AI 智能配置（推荐）🤖

让 AI 根据项目需求自动生成配置：

```bash
cd workspaces/your-project
npm run canvas-ai
```

**示例对话**：
```
🤖 === AI 智能配置建议 ===

请描述你的项目需求:
> 开发一个电商网站，需要用户登录、商品管理、购物车功能

🔍 正在分析需求...

📊 AI 推荐配置：

🔧 推荐的 Skills (6 个):
  ✓ React 开发 (react-dev)
  ✓ API 开发 (api-development)
  ✓ 数据库设计 (database-design)
  ✓ 身份认证 (authentication)
  ✓ Docker (docker)
  ✓ 单元测试 (unit-testing)

👥 推荐的 Agents (4 个):
  ✓ 前端开发工程师 (frontend-dev)
     技能: React 开发, UI/UX 设计, 状态管理
  ✓ 后端开发工程师 (backend-dev)
     技能: API 开发, 数据库设计, 身份认证
  ✓ DevOps 工程师 (devops)
     技能: Docker, CI/CD
  ✓ 测试工程师 (tester)
     技能: 单元测试

是否应用此配置？(y/n) [y]: y

✅ 配置已保存到: .onecompany/canvas-config.json
```

---

### 2️⃣ CLI 快速配置

手动快速配置：

```bash
cd workspaces/your-project

# 查看帮助
npm run canvas-config help

# 从模板初始化
npm run canvas-config init fullstack

# 或手动添加
npm run canvas-config add-skill react-dev
npm run canvas-config add-agent frontend-dev

# 查看配置
npm run canvas-config list
```

---

### 3️⃣ Canvas 可视化配置

使用图形界面配置：

```bash
cd packages/canvas-app
npm run dev
# 打开浏览器，拖拽配置
```

---

## 📋 CLI 命令详解

### 基础命令

```bash
# 列出当前配置
npm run canvas-config list

# 从模板初始化
npm run canvas-config init <template>
# 可用模板: fullstack, frontend, backend
```

### 添加节点

```bash
# 添加 Skill
npm run canvas-config add-skill <skill-id>

# 添加 Agent
npm run canvas-config add-agent <agent-role>
```

### 管理节点

```bash
# 启用节点
npm run canvas-config enable <node-id>

# 禁用节点
npm run canvas-config disable <node-id>

# 删除节点
npm run canvas-config remove <node-id>
```

---

## 🎯 完整工作流程

### 场景 1：新项目（AI 推荐）

```bash
# 1. 创建项目
npm run onecompany
# 选择 "1. 新建项目"

# 2. 进入项目目录
cd workspaces/my-project

# 3. AI 智能配置
npm run canvas-ai
# 描述项目需求，AI 自动生成配置

# 4. 查看配置
npm run canvas-config list

# 5. 使用配置运行 Agent 模式
cd ../..
npm run onecompany
# 选择 "4. Agent 协作模式"
```

### 场景 2：快速配置

```bash
# 1. 进入项目
cd workspaces/my-project

# 2. 从模板初始化
npm run canvas-config init fullstack

# 3. 调整配置
npm run canvas-config add-skill graphql
npm run canvas-config disable unit-testing

# 4. 查看结果
npm run canvas-config list

# 5. 提交配置
git add .onecompany/canvas-config.json
git commit -m "Add canvas configuration"
```

### 场景 3：可视化调整

```bash
# 1. CLI 快速初始化
cd workspaces/my-project
npm run canvas-config init fullstack

# 2. 在 Canvas 中可视化调整
cd ../../packages/canvas-app
npm run dev
# 打开浏览器，选择项目，调整配置

# 3. 保存并使用
# Canvas 会自动保存到 localStorage
# 或点击"保存配置"下载文件
```

---

## 🔧 可用的 Skills

| Skill ID | 名称 | 类别 |
|----------|------|------|
| `react-dev` | React 开发 | Frontend |
| `vue-dev` | Vue 开发 | Frontend |
| `api-development` | API 开发 | Backend |
| `database-design` | 数据库设计 | Backend |
| `ui-design` | UI/UX 设计 | Design |
| `unit-testing` | 单元测试 | Testing |
| `authentication` | 身份认证 | Security |
| `state-management` | 状态管理 | Frontend |
| `docker` | Docker | DevOps |
| `ci-cd` | CI/CD | DevOps |
| `graphql` | GraphQL | Backend |
| `responsive-layout` | 响应式布局 | Frontend |

---

## 👥 可用的 Agents

| Agent Role | 名称 | 默认技能 |
|------------|------|----------|
| `frontend-dev` | 前端开发工程师 | react-dev, ui-design, state-management |
| `backend-dev` | 后端开发工程师 | api-development, database-design, authentication |
| `fullstack-dev` | 全栈开发工程师 | api-development, react-dev, database-design |
| `devops` | DevOps 工程师 | docker, ci-cd |
| `tester` | 测试工程师 | unit-testing |
| `designer` | UI/UX 设计师 | ui-design |

---

## 🤖 AI 智能推荐规则

AI 会根据你的需求描述中的关键词，智能推荐配置：

### 关键词匹配

- **前端**: react-dev, vue-dev, ui-design → frontend-dev
- **后端**: api-development, database-design → backend-dev
- **登录/认证**: authentication → backend-dev
- **测试**: unit-testing → tester
- **部署**: docker, ci-cd → devops

### 智能推荐

- 如果有前端 + 后端 → 自动推荐 DevOps
- 如果有 API 开发 → 自动推荐数据库设计
- 如果有任何开发 → 自动推荐测试

### 示例需求

| 需求描述 | AI 推荐 |
|---------|---------|
| "开发一个博客网站" | React, API, 数据库, 前端工程师, 后端工程师, DevOps |
| "做一个移动端 App" | React, 响应式布局, UI 设计, 前端工程师, 设计师 |
| "构建 RESTful API" | API 开发, 数据库, 认证, 后端工程师, DevOps, 测试 |
| "全栈电商平台" | 所有 Skills, 所有 Agents |

---

## 💡 最佳实践

### 1. 项目初始化

```bash
# 推荐流程
cd workspaces/new-project
npm run canvas-ai          # AI 生成初始配置
npm run canvas-config list # 查看配置
# 如需调整，使用 CLI 命令或 Canvas GUI
```

### 2. 配置版本控制

```bash
# 配置文件应该提交到 Git
git add .onecompany/canvas-config.json
git commit -m "feat: add canvas configuration"
git push
```

### 3. 团队协作

**架构师**：
```bash
# 使用 AI 生成配置
npm run canvas-ai

# 或手动配置
npm run canvas-config init fullstack
npm run canvas-config add-skill graphql

# 提交配置
git add .onecompany/canvas-config.json
git commit -m "Add project canvas config"
git push
```

**团队成员**：
```bash
# 拉取配置
git pull

# 查看配置
npm run canvas-config list

# 使用配置
npm run onecompany
# 选择 "4. Agent 协作模式"
```

### 4. 配置调整

```bash
# 快速调整用 CLI
npm run canvas-config add-skill new-skill
npm run canvas-config disable old-skill

# 复杂调整用 Canvas GUI
cd packages/canvas-app
npm run dev
```

---

## 🎉 优势对比

### 传统方式（Canvas GUI）

```
启动 Canvas → 打开浏览器 → 拖拽配置 → 保存下载 → CLI 导入 → Git 提交
⏱️  约 5-10 分钟
```

### 新方式（AI + CLI）

```
npm run canvas-ai → 描述需求 → 确认 → 完成
⏱️  约 30 秒
```

**效率提升 10-20 倍！** 🚀

---

## 🔄 三种方式对比

| 方式 | 速度 | 灵活性 | 适用场景 |
|------|------|--------|----------|
| **AI 智能配置** | ⚡⚡⚡ | ⭐⭐ | 新项目初始化 |
| **CLI 快速配置** | ⚡⚡ | ⭐⭐⭐ | 快速调整、脚本化 |
| **Canvas GUI** | ⚡ | ⭐⭐⭐⭐⭐ | 复杂配置、可视化展示 |

**推荐组合**：
1. 用 **AI** 生成初始配置
2. 用 **CLI** 快速调整
3. 用 **Canvas** 可视化查看和复杂调整

---

## 📝 示例

### 示例 1：快速开始

```bash
cd workspaces/my-blog
npm run canvas-ai
```

输入：`开发一个个人博客，支持 Markdown 编辑和评论功能`

AI 自动生成配置，包含：
- React 开发、API 开发、数据库设计
- 前端工程师、后端工程师、DevOps

### 示例 2：手动配置

```bash
cd workspaces/my-api
npm run canvas-config init backend
npm run canvas-config add-skill graphql
npm run canvas-config list
```

### 示例 3：混合使用

```bash
# 1. AI 生成基础配置
npm run canvas-ai

# 2. CLI 添加特殊需求
npm run canvas-config add-skill graphql

# 3. Canvas 可视化查看
cd ../../packages/canvas-app
npm run dev
```

---

## 🎯 总结

现在你有 **3 种强大的配置方式**：

1. **🤖 AI 智能配置** - 最快速，适合新项目
2. **⚡ CLI 快速配置** - 最灵活，适合脚本化
3. **🎨 Canvas GUI** - 最直观，适合复杂调整

**推荐工作流程**：
```
AI 生成 → CLI 调整 → Canvas 查看 → Agent 执行
```

享受高效的配置体验！🎉
