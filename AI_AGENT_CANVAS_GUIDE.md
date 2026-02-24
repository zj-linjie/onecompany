# AI Agent 使用 Canvas 配置指南

## 🤖 给 AI Agent 的指引

当用户描述项目需求时，你应该：

### 1. 识别配置需求

当用户说类似这些话时，应该使用 Canvas 配置：

- "我要开发一个 XXX 项目"
- "帮我配置项目的技术栈"
- "我需要哪些 Agent 来完成这个项目"
- "设置项目的 Skills 和 Agents"
- 任何涉及项目初始化、技术栈选择的场景

### 2. 自动执行配置

**立即执行以下命令**：

```bash
cd workspaces/<project-name>
npm run canvas-ai
```

**在命令执行时，输入用户的需求描述**。

### 3. 配置完成后的操作

配置生成后，告诉用户：

```
✅ 我已经根据你的需求自动配置了项目：

📊 配置概览：
- X 个 Skills
- Y 个 Agents

🎨 你可以通过以下方式查看和调整：

1. 命令行查看：
   npm run canvas-config list

2. 可视化查看和调整（推荐）：
   cd packages/canvas-app
   npm run dev
   然后在浏览器中打开，选择你的项目

3. 使用配置运行 Agent 模式：
   npm run onecompany
   选择 "4. Agent 协作模式"
```

---

## 📋 使用场景示例

### 场景 1：用户创建新项目

**用户**：我要开发一个博客网站，支持 Markdown 编辑和评论

**AI 应该做**：
```bash
# 1. 创建项目（如果需要）
npm run onecompany
# 选择 "1. 新建项目"

# 2. 进入项目目录
cd workspaces/blog-project

# 3. 自动配置
npm run canvas-ai
# 输入：开发一个博客网站，支持 Markdown 编辑和评论功能

# 4. 告诉用户配置已完成，并提供查看方式
```

### 场景 2：用户询问技术栈

**用户**：我这个电商项目需要配置哪些技术栈？

**AI 应该做**：
```bash
cd workspaces/ecommerce-project
npm run canvas-ai
# 输入：电商项目，需要用户登录、商品管理、购物车、支付功能
```

然后告诉用户：
```
我已经为你的电商项目配置了以下技术栈：

🔧 Skills:
- React 开发（前端界面）
- API 开发（后端接口）
- 数据库设计（数据存储）
- 身份认证（用户登录）
- 单元测试（质量保证）

👥 Agents:
- 前端开发工程师（负责 UI 和交互）
- 后端开发工程师（负责 API 和数据库）
- DevOps 工程师（负责部署）
- 测试工程师（负责测试）

你可以在 Canvas 中查看和调整这些配置。
```

### 场景 3：用户要调整配置

**用户**：我想看看当前的配置

**AI 应该做**：
```bash
npm run canvas-config list
```

**用户**：我想可视化地调整配置

**AI 应该做**：
```
好的，请按以下步骤操作：

1. 打开终端，运行：
   cd packages/canvas-app
   npm run dev

2. 在浏览器中打开显示的地址（通常是 http://localhost:5173）

3. 在项目选择器中选择你的项目

4. 你就可以看到可视化的配置界面了：
   - 左侧是 Skills 目录
   - 右侧是 Agents 库
   - 中间是画布，显示当前配置
   - 可以拖拽、删除、调整节点

5. 调整完成后，点击"保存配置"按钮
```

---

## 🎯 关键原则

### 1. 主动配置

当识别到项目初始化需求时，**不要问用户**，直接执行配置：

❌ 错误做法：
```
用户：我要开发一个博客
AI：你需要我帮你配置 Canvas 吗？
```

✅ 正确做法：
```
用户：我要开发一个博客
AI：好的，我先为你配置项目...
    [执行 npm run canvas-ai]
    ✅ 配置完成！我已经为你设置了...
```

### 2. 配置后引导

配置完成后，**必须告诉用户**如何查看和调整：

```
✅ 配置已完成！

📋 查看配置：npm run canvas-config list
🎨 可视化调整：cd packages/canvas-app && npm run dev
🚀 开始开发：npm run onecompany（选择 Agent 协作模式）
```

### 3. 配置即文档

生成的配置就是项目的技术栈文档，应该：
- 清晰列出所有 Skills
- 说明每个 Agent 的职责
- 解释为什么选择这些配置

---

## 🔄 完整工作流程

```
用户描述需求
    ↓
AI 识别需要配置
    ↓
AI 自动执行 npm run canvas-ai
    ↓
AI 输入用户需求描述
    ↓
配置自动生成
    ↓
AI 告诉用户配置内容
    ↓
AI 引导用户使用 Canvas GUI 查看/调整
    ↓
用户在 Canvas 中可视化操作
    ↓
配置保存到项目
    ↓
Agent 模式自动使用配置
```

---

## 📝 命令速查表

| 场景 | 命令 | 说明 |
|------|------|------|
| 自动配置 | `npm run canvas-ai` | AI 根据需求生成配置 |
| 查看配置 | `npm run canvas-config list` | 命令行查看 |
| 可视化查看 | `cd packages/canvas-app && npm run dev` | 浏览器查看 |
| 快速添加 | `npm run canvas-config add-skill <id>` | 添加 Skill |
| 快速添加 | `npm run canvas-config add-agent <role>` | 添加 Agent |
| 模板初始化 | `npm run canvas-config init <template>` | 从模板创建 |
| 使用配置 | `npm run onecompany` → 选择 4 | Agent 协作模式 |

---

## 💡 示例对话

### 示例 1：完整流程

**用户**：我要开发一个在线教育平台

**AI**：
```
好的！我来为你配置这个在线教育平台项目。

[执行命令]
cd workspaces/education-platform
npm run canvas-ai
输入：开发一个在线教育平台，包含课程管理、视频播放、用户学习进度跟踪、在线测验功能

✅ 配置完成！

📊 我为你配置了以下技术栈：

🔧 Skills (7 个):
  ✓ React 开发 - 前端界面开发
  ✓ API 开发 - 后端接口
  ✓ 数据库设计 - 数据存储
  ✓ 身份认证 - 用户登录
  ✓ 状态管理 - 前端状态
  ✓ Docker - 容器化部署
  ✓ 单元测试 - 质量保证

👥 Agents (4 个):
  ✓ 前端开发工程师 - 负责课程界面、视频播放器、学习进度展示
  ✓ 后端开发工程师 - 负责课程管理 API、用户数据、测验系统
  ✓ DevOps 工程师 - 负责部署和运维
  ✓ 测试工程师 - 负责功能测试

🎨 你可以通过以下方式查看和调整配置：

1. 命令行查看：
   npm run canvas-config list

2. 可视化查看和调整（推荐）：
   cd packages/canvas-app
   npm run dev
   在浏览器中选择 "education-platform" 项目

3. 开始开发：
   npm run onecompany
   选择 "4. Agent 协作模式"

需要我帮你调整配置吗？
```

### 示例 2：用户想查看

**用户**：我想看看当前的配置

**AI**：
```
[执行命令]
npm run canvas-config list

当前配置：
[显示配置列表]

如果你想可视化地查看和调整，可以：
cd packages/canvas-app
npm run dev

然后在浏览器中打开，你就能看到图形化的配置界面了。
```

### 示例 3：用户想调整

**用户**：我想添加 GraphQL 支持

**AI**：
```
好的，我帮你添加 GraphQL。

[执行命令]
npm run canvas-config add-skill graphql

✅ 已添加 GraphQL Skill

你也可以在 Canvas 中查看这个变化：
cd packages/canvas-app
npm run dev
```

---

## 🎯 总结

**AI Agent 的职责**：
1. ✅ 识别配置需求
2. ✅ 自动执行 `npm run canvas-ai`
3. ✅ 生成配置
4. ✅ 告诉用户配置内容
5. ✅ 引导用户使用 Canvas GUI

**用户的职责**：
1. ✅ 在 Canvas GUI 中可视化查看
2. ✅ 拖拽调整配置
3. ✅ 保存配置
4. ✅ 使用配置开发

**Canvas 的角色**：
- 不是独立项目
- 是配置的可视化界面
- 是用户调整配置的工具
- 是 AI 配置的展示窗口
