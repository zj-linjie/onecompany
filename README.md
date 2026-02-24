# onecompany

CLI-first TypeScript monorepo for a one-person AI software company team with Multi-Agent collaboration.

## What it does (v0.2.0)

### 🤖 Multi-Agent Mode (NEW!)
- **Automatic Task Decomposition**: Describe your requirement, AI agents automatically break it down into 3-7 executable tasks
- **Intelligent Agent Routing**: Tasks are assigned to specialized agents (PM, Architect, Frontend Dev, Backend Dev, Tester, etc.)
- **Parallel Execution**: Independent tasks run concurrently for maximum efficiency
- **State Persistence**: All progress is automatically saved and can be resumed
- **Execution Logging**: Complete audit trail of all agent activities

### Traditional Modes
- `new project`: create a new project workspace with standard docs templates
- `takeover`: analyze an existing local project and generate takeover docs
- `iterate`: continue development tasks with skill routing and quality gates

## Architecture

```
User Input: "实现用户登录功能"
    ↓
PM Agent (Task Decomposer)
    ↓
[Task 1: API Design] [Task 2: Backend] [Task 3: Frontend] [Task 4: Testing]
    ↓
Task Scheduler (with dependency management)
    ↓
Task 1 → Architect Agent → ✅
    ↓
Task 2 & 3 (parallel) → Backend Agent & Frontend Agent → ✅
    ↓
Task 4 → Tester Agent → ✅
```

## Structure

- `apps/cli`: interactive CLI entry point with Multi-Agent mode
- `packages/core`: orchestration core with agent framework
  - `agent.ts`: Agent abstraction layer
  - `task.ts` & `task-queue.ts`: Task management
  - `orchestrator.ts`: Multi-agent coordination
  - `task-decomposer.ts`: Intelligent task breakdown
  - `task-scheduler.ts`: Parallel execution control
  - `state-manager.ts`: Persistence layer
  - `subagent-executor.ts`: Agent execution via Task tool
- `packages/flow-*`: thin wrappers for each flow
- `packages/skills-catalog`: role/skill routing exports
- `workspaces/<project-slug>/`: per-project workspaces
  - `docs/`: project knowledge base
  - `.onecompany/`: agent state and execution logs

## Quick start

```bash
cd /Users/apple/dev/onecompany
npm install
npm run build
npm run start
```

Then select option **4. Agent 协作模式 🤖** to try the new Multi-Agent mode!

## Multi-Agent Mode Example

```bash
$ npm run start

=== OneCompany CLI (v0.2.0 - Multi-Agent) ===

请选择操作：
1. 新建项目
2. 接管旧项目（本地目录）
3. 继续迭代（传统模式）
4. Agent 协作模式 🤖 (NEW!)
5. 退出

输入编号 [4]: 4

🤖 === Agent 协作模式 ===

在这个模式下，AI agents 会自动：
1. 分解你的需求为多个任务
2. 智能分配给不同的专业 agent
3. 并行执行独立任务
4. 自动保存进度和状态

请描述你的需求（例如：实现用户登录功能）
需求描述: 实现用户注册和登录功能

📋 正在分解任务...

✅ 成功分解为 4 个任务：

1. [architecture] 设计用户认证 API 接口
   状态: ready | 优先级: 10
2. [backend] 实现用户注册逻辑
   状态: pending | 优先级: 9 (依赖: 1 个任务)
3. [backend] 实现用户登录逻辑
   状态: pending | 优先级: 9 (依赖: 1 个任务)
4. [testing] 编写集成测试
   状态: pending | 优先级: 7 (依赖: 2 个任务)

是否开始执行？(y/n) [y]: y

🚀 开始执行任务...

[Orchestrator] Progress: 1/4 completed, 2 running, 0 failed
[Orchestrator] Progress: 3/4 completed, 1 running, 0 failed
[Orchestrator] Progress: 4/4 completed, 0 running, 0 failed

✅ 执行完成！

总任务数: 4
已完成: 4
失败: 0

💾 状态已保存到: workspaces/my-project/.onecompany/
```

## Agent Roles

- **Product Manager**: Requirements analysis and task decomposition
- **Architect**: System design and API specification
- **Frontend Developer**: UI implementation
- **Backend Developer**: API and business logic
- **Tester**: Test writing and quality assurance
- **Spec Reviewer**: Verify implementation matches requirements
- **Code Reviewer**: Code quality and best practices

## State Persistence

All agent activities are automatically saved:

```
workspaces/my-project/
└── .onecompany/
    ├── tasks.json           # Task queue with dependencies
    └── execution-log.json   # Complete execution history
```

You can resume interrupted sessions at any time!

## Quality gates

Before claiming a task complete, always run:

1. Request code review
2. Verify with tests/build
3. Record changelog and dev log updates

## Testing

```bash
cd packages/core
npm test
```

All 63 tests passing! ✅

## What's New in v0.2.0

- 🤖 **Multi-Agent Collaboration Framework**: Complete rewrite with agent orchestration
- 📋 **Intelligent Task Decomposition**: PM Agent automatically breaks down requirements
- ⚡ **Parallel Execution**: Independent tasks run concurrently
- 💾 **State Persistence**: Resume from where you left off
- 📊 **Execution Logging**: Full audit trail of agent activities
- 🎯 **Smart Agent Routing**: Tasks automatically assigned to specialized agents

## Roadmap

### v0.3.0 (Next)
- Two-stage review system (Spec + Code review)
- Real Task tool integration (currently simulated)
- Web UI for monitoring agent activities
- Custom agent definitions

### v0.4.0
- Agent performance analytics
- Learning from execution history
- Multi-project orchestration
- Remote agent execution

## Contributing

This is an experimental project exploring Multi-Agent collaboration patterns for software development.

## License

MIT
