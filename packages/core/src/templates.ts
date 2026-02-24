import type { NewProjectInput, ScanSummary } from "./types.js";

export function projectBriefTemplate(input: NewProjectInput): string {
  return `# 项目简介（Project Brief）

- 项目名称：${input.projectName}
- 模式：${input.productMode}
- 创建者：${input.creator}
- 创建时间：${new Date().toLocaleString()}

## 背景
${input.projectDescription}

## 目标
- 建立“一人公司”可持续研发流程
- 支持新项目从0到1创建
- 支持旧项目接管后继续迭代/二次开发

## 边界（当前阶段）
- v0.1 以 CLI 为主
- 旧项目接管仅支持本地目录
- 知识库采用仓库内 Markdown

## 成功标准
- 能在 10 分钟内完成一个新项目初始化
- 能对旧项目输出接管评估和二开任务清单
- 每次迭代都能经过统一质量门禁
`;
}

export function architectureTemplate(projectName: string): string {
  return `# 系统架构（Architecture）

## 总览
${projectName} 使用 TypeScript Monorepo + 插件化 flow 设计。

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
`;
}

export function prdTemplate(projectName: string): string {
  return `# 产品需求（PRD）

## 产品名
${projectName}

## 用户
- 一人公司创始人/开发者

## 核心场景
1. 创建新项目骨架与文档
2. 接管旧项目并快速识别风险
3. 按任务类型进入可控迭代

## 功能清单（v0.1）
- 交互式菜单
- new-project
- takeover(local-path)
- iterate
- 技能路由与质量门禁提示

## 非功能要求
- 执行路径清晰
- 输出文档可追踪
- 错误提示可读
`;
}

export function taskBoardTemplate(): string {
  return `# 任务看板（Task Board）

## Backlog
- [ ] 定义下一阶段优先级（Web 控制台 or Git URL 接管）
- [ ] 补充项目指标与验收标准

## In Progress
- [ ] （空）

## Done
- [x] 初始化一人公司项目结构
`;
}

export function devLogTemplate(): string {
  return `# 开发日志（Dev Log）

## 记录规范
- 每次迭代记录：时间、任务、技能包、结论、后续动作

`;
}

export function changeLogTemplate(): string {
  return `# 变更日志（Change Log）

## v0.1.0
- 初始化 onecompany CLI-first monorepo
- 新建项目 / 旧项目接管 / 持续迭代三流程落地
`;
}

export function takeoverBriefTemplate(scan: ScanSummary, owner: string): string {
  return `# 项目接管评估（Project Brief）

- 来源目录：${scan.sourcePath}
- 接管项目名：${scan.projectName}
- 接管负责人：${owner}
- 生成时间：${new Date().toLocaleString()}

## 现状摘要
- 文件数量：${scan.fileCount}
- 语言：${scan.languages.join(", ") || "未识别"}
- 框架：${scan.frameworks.join(", ") || "未识别"}
- 包管理器：${scan.packageManagers.join(", ") || "未识别"}

## 风险
${scan.risks.map((x) => `- ${x}`).join("\n") || "- 暂无明显风险"}

## 建议
${scan.recommendations.map((x) => `- ${x}`).join("\n") || "- 建议补充最小文档并开始迭代"}
`;
}

export function takeoverArchitectureTemplate(scan: ScanSummary): string {
  return `# 接管架构快照（Architecture Snapshot）

## 技术识别
- 语言：${scan.languages.join(", ") || "未识别"}
- 框架：${scan.frameworks.join(", ") || "未识别"}
- 包管理器：${scan.packageManagers.join(", ") || "未识别"}

## 文档现状
- 已发现文档：${scan.docsFound.join(", ") || "无"}
- 缺失基础文档：${scan.missingFoundations.join(", ") || "无"}

## 迭代建议架构
1. 先补核心文档（Brief/Architecture/Task Board）
2. 将高风险模块优先拆解为小任务
3. 引入统一质量门禁避免回归
`;
}

export function takeoverTaskBoardTemplate(scan: ScanSummary): string {
  const riskTasks = scan.risks.map((risk) => `- [ ] 处理风险：${risk}`);
  const baseTasks = [
    "- [ ] 梳理并确认业务目标与边界",
    "- [ ] 建立最小可运行验证（build/test/run）",
    "- [ ] 为优先模块补测试与回归用例",
    "- [ ] 输出首轮二开里程碑"
  ];

  return `# 接管任务看板（Task Board）

## Backlog
${[...baseTasks, ...riskTasks].join("\n")}

## In Progress
- [ ] （空）

## Done
- [x] 完成项目接管扫描与初步评估
`;
}
