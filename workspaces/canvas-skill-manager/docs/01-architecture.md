# 系统架构（Architecture）

## 总览
canvas-skill-manager 使用 TypeScript Monorepo + 插件化 flow 设计。

## 目录
- apps/cli：交互式入口
- packages/core：编排内核（模板/扫描/路由）
- packages/flow-new-project：新项目创建流程
- packages/flow-takeover：旧项目接管流程
- packages/flow-iterate：持续迭代流程
- packages/skills-catalog：角色到技能包映射

## 流程
1. Brainstorming（需求澄清）
2. Writing-plans（计划生成）
3. Development（按任务类型路由技能）
4. Quality Gate（评审 -> 验证 -> 收尾）

## 架构原则
- CLI 优先，能力先行
- 文档即系统记忆
- 流程与角色解耦，可扩展技能路由
