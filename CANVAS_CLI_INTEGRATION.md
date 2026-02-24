# Canvas CLI 集成使用指南

## 🎯 概述

Canvas Skill Manager 现已与 OneCompany CLI 深度集成，实现了配置的无缝管理。

## 🔄 完整工作流程

### 1. 在 Canvas 中配置项目

```bash
# 启动 Canvas 应用
cd packages/canvas-app
npm run dev
```

在浏览器中：
1. 选择或创建项目
2. 拖拽 Skills 和 Agents 到画布
3. 配置节点属性
4. 点击"保存配置"按钮
5. 文件下载到 `~/Downloads/canvas-config.json`

### 2. 使用 CLI 保存配置到项目

```bash
# 运行 OneCompany CLI
npm run onecompany

# 选择 "5. Canvas 配置管理"
# 选择 "1. 从 Canvas 保存配置到项目"
# 选择目标项目
# 选择 "1. 从下载的文件导入"
```

CLI 会自动：
- ✅ 检测 `~/Downloads/canvas-config.json`
- ✅ 验证配置格式
- ✅ 创建 `.onecompany/` 目录（如果不存在）
- ✅ 保存配置到项目的 `.onecompany/canvas-config.json`
- ✅ 显示配置概览

### 3. 查看项目配置

```bash
npm run onecompany

# 选择 "5. Canvas 配置管理"
# 选择 "2. 查看项目配置"
# 选择要查看的项目
```

显示内容：
- 📊 配置版本和项目信息
- 👥 所有 Agents（启用/禁用状态）
- 🔧 所有 Skills（启用/禁用状态）
- 🔗 连接关系

### 4. 使用配置运行 Agent 模式

```bash
npm run onecompany

# 选择 "4. Agent 协作模式"
# 选择已配置的项目
# 系统自动加载 Canvas 配置
# 输入需求，开始执行
```

---

## 📁 文件结构

```
project/
├── .onecompany/
│   ├── canvas-config.json      # Canvas 配置（由 CLI 保存）
│   ├── tasks.json              # 任务队列
│   └── execution-log.json      # 执行日志
├── docs/
├── src/
└── package.json
```

---

## 🎨 Canvas 配置格式

```json
{
  "version": "1.0.0",
  "project": {
    "id": "project-1",
    "type": "project",
    "name": "My Project",
    "path": "/path/to/project"
  },
  "nodes": [
    {
      "id": "skill-1",
      "type": "skill",
      "skillId": "react-dev",
      "name": "React 开发",
      "description": "现代 React 开发",
      "enabled": true,
      "position": { "x": 100, "y": 200 }
    },
    {
      "id": "agent-1",
      "type": "agent",
      "role": "frontend-dev",
      "name": "前端开发工程师",
      "skills": ["react-dev", "ui-design"],
      "enabled": true,
      "position": { "x": 700, "y": 200 },
      "specialization": "React 和 UI/UX 专家"
    }
  ],
  "connections": []
}
```

---

## 💡 使用场景

### 场景 1：新项目初始化

```bash
# 1. 在 Canvas 中配置项目
# 2. 保存配置
npm run onecompany
# 选择 "5. Canvas 配置管理"
# 选择 "1. 从 Canvas 保存配置到项目"

# 3. 提交到 Git
cd workspaces/my-project
git add .onecompany/canvas-config.json
git commit -m "Add canvas configuration"
git push
```

### 场景 2：团队协作

**架构师**：
```bash
# 1. 在 Canvas 中配置项目
# 2. 使用 CLI 保存到项目
# 3. 提交到 Git
git add .onecompany/canvas-config.json
git commit -m "Update canvas config: add mobile agent"
git push
```

**团队成员**：
```bash
# 1. 拉取最新代码
git pull

# 2. 查看配置
npm run onecompany
# 选择 "5. Canvas 配置管理"
# 选择 "2. 查看项目配置"

# 3. 使用配置运行 Agent 模式
npm run onecompany
# 选择 "4. Agent 协作模式"
```

### 场景 3：配置更新

```bash
# 1. 在 Canvas 中修改配置
# 2. 保存配置
# 3. 使用 CLI 更新项目配置
npm run onecompany
# 选择 "5. Canvas 配置管理"
# 选择 "1. 从 Canvas 保存配置到项目"

# 4. 验证配置
npm run onecompany
# 选择 "5. Canvas 配置管理"
# 选择 "2. 查看项目配置"

# 5. 提交更新
git add .onecompany/canvas-config.json
git commit -m "Update canvas config"
git push
```

---

## 🔧 CLI 命令详解

### 5. Canvas 配置管理

#### 1. 从 Canvas 保存配置到项目

**功能**：
- 从下载的 `canvas-config.json` 导入配置
- 或从自定义路径导入配置
- 保存到项目的 `.onecompany/canvas-config.json`

**步骤**：
1. 选择目标项目
2. 选择配置来源：
   - 从下载文件夹（自动检测 `~/Downloads/canvas-config.json`）
   - 手动输入文件路径
3. 验证配置格式
4. 保存到项目目录
5. 显示配置概览和下一步建议

**输出示例**：
```
✅ 配置已保存到: /path/to/project/.onecompany/canvas-config.json

📊 配置概览：
   - 版本: 1.0.0
   - 节点数: 7
   - Agents: 3 个
     • 前端开发工程师 (frontend-dev)
     • 后端开发工程师 (backend-dev)
     • 测试工程师 (tester)
   - Skills: 4 个
     • React 开发
     • API 开发
     • 数据库设计
     • 单元测试

💡 下一步：
   1. 提交到 Git:
      cd /path/to/project
      git add .onecompany/canvas-config.json
      git commit -m "Update canvas configuration"

   2. 运行 Agent 模式测试配置:
      npm run onecompany
      选择 "4. Agent 协作模式"
```

#### 2. 查看项目配置

**功能**：
- 读取项目的 Canvas 配置
- 显示详细的配置信息
- 列出所有 Agents 和 Skills

**输出示例**：
```
✅ 配置文件: /path/to/project/.onecompany/canvas-config.json

📊 配置详情：
   版本: 1.0.0
   项目: My Project
   节点总数: 7

👥 Agents (3 个，3 个启用):
   ✓ 前端开发工程师 (frontend-dev)
      专长: React 和 UI/UX 专家
      技能: react-dev, ui-design, state-management
   ✓ 后端开发工程师 (backend-dev)
      专长: API 和数据库专家
      技能: api-development, database-design, authentication
   ✓ 测试工程师 (tester)
      专长: 质量保证专家
      技能: unit-testing, integration-testing, e2e-testing

🔧 Skills (4 个，4 个启用):
   ✓ React 开发 (react-dev)
      现代 React 开发，Hooks、TypeScript、性能优化
   ✓ API 开发 (api-development)
      RESTful API 设计与实现，包括接口规范、版本控制
   ✓ 数据库设计 (database-design)
      SQL 和 NoSQL 数据库架构设计，性能优化
   ✓ 单元测试 (unit-testing)
      Jest、Vitest 等测试框架，TDD 实践

🔗 连接: 0 个
```

---

## 🎯 最佳实践

### 1. 配置版本控制

**推荐做法**：
```bash
# 每次更新配置后
git add .onecompany/canvas-config.json
git commit -m "feat: update canvas config - add mobile agent"
git push
```

**不推荐**：
- ❌ 不提交配置文件
- ❌ 手动编辑配置文件
- ❌ 配置文件不同步

### 2. 配置备份

**推荐做法**：
```bash
# 定期备份配置
cp .onecompany/canvas-config.json .onecompany/canvas-config.backup.json

# 或使用 Git 标签
git tag -a canvas-config-v1.0 -m "Stable canvas configuration"
git push --tags
```

### 3. 团队协作

**推荐流程**：
1. 架构师在 Canvas 中设计配置
2. 使用 CLI 保存到项目
3. 创建 PR 并说明变更
4. 团队 Review 配置
5. 合并后通知团队成员
6. 团队成员拉取最新配置

### 4. 配置测试

**推荐做法**：
```bash
# 保存配置后立即测试
npm run onecompany
# 选择 "4. Agent 协作模式"
# 输入简单需求测试配置是否正确加载
```

---

## 🐛 故障排查

### 问题 1：找不到配置文件

**症状**：
```
⚠️  未在下载文件夹找到 canvas-config.json
```

**解决方案**：
1. 确认在 Canvas 中点击了"保存配置"按钮
2. 检查下载文件夹：`ls ~/Downloads/canvas-config.json`
3. 或使用"手动输入配置文件路径"选项

### 问题 2：配置格式无效

**症状**：
```
❌ 配置格式无效
```

**解决方案**：
1. 确认文件是从 Canvas 导出的
2. 检查 JSON 格式：`cat canvas-config.json | jq`
3. 确认包含必需字段：`version`, `nodes`, `connections`

### 问题 3：Agent 模式未加载配置

**症状**：
```
ℹ️  未找到 Canvas 配置，使用默认 Agent 配置
```

**解决方案**：
1. 确认配置文件存在：`ls .onecompany/canvas-config.json`
2. 验证配置格式：使用 CLI 的"查看项目配置"功能
3. 检查文件权限：`chmod 644 .onecompany/canvas-config.json`

---

## 📊 配置统计

查看所有项目的配置状态：

```bash
# 列出所有项目的配置
for project in workspaces/*; do
  if [ -f "$project/.onecompany/canvas-config.json" ]; then
    echo "✓ $project - 已配置"
  else
    echo "✗ $project - 未配置"
  fi
done
```

---

## 🚀 快速开始

### 第一次使用

```bash
# 1. 启动 Canvas 应用
cd packages/canvas-app
npm run dev

# 2. 在浏览器中配置项目
# 3. 点击"保存配置"

# 4. 使用 CLI 保存到项目
cd ../..
npm run onecompany
# 选择 "5. Canvas 配置管理"
# 选择 "1. 从 Canvas 保存配置到项目"

# 5. 测试配置
npm run onecompany
# 选择 "4. Agent 协作模式"
```

### 日常使用

```bash
# 修改配置
# 1. 在 Canvas 中修改
# 2. 保存配置
# 3. 使用 CLI 更新项目

npm run onecompany
# 选择 "5. Canvas 配置管理"
# 选择 "1. 从 Canvas 保存配置到项目"

# 提交更新
git add .onecompany/canvas-config.json
git commit -m "Update canvas config"
git push
```

---

## 📝 总结

Canvas CLI 集成提供了：

✅ **无缝配置管理** - Canvas 可视化配置 + CLI 自动保存
✅ **团队协作** - 配置文件版本控制，团队共享
✅ **自动化执行** - Agent 模式自动加载配置
✅ **配置验证** - CLI 验证配置格式和完整性
✅ **详细反馈** - 显示配置概览和下一步建议

现在你可以：
1. 在 Canvas 中可视化配置项目
2. 使用 CLI 一键保存到项目
3. 提交到 Git 与团队共享
4. Agent 模式自动使用配置

享受高效的配置管理体验！🎉
