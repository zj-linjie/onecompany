/**
 * 代码审查器
 * 检查代码质量和最佳实践
 */

import type { Task, AgentContext } from "../types.js";
import { BaseReviewer, type ReviewResult, type ReviewIssue } from "./base-reviewer.js";
import { createAgentExecutor } from "../subagent-executor.js";

export class CodeReviewer extends BaseReviewer {
  constructor() {
    super("code-reviewer-" + Date.now(), "code-reviewer", ["code-quality", "best-practices", "security-review"]);
  }

  protected async review(task: Task, context: AgentContext): Promise<ReviewResult> {
    // 使用 code-reviewer agent 进行审查
    const agent = createAgentExecutor("code-reviewer");

    // 构建审查任务
    const reviewTask: Task = {
      ...task,
      id: `code-review-${task.id}`,
      title: `Code Review: ${task.title}`,
      description: `Review the code quality of task "${task.title}".\n\n**Task Description**:\n${task.description}\n\n**Implementation**:\n${task.result?.output || "No output available"}\n\nFocus on:\n- Code quality and readability\n- Best practices\n- Security issues\n- Performance concerns\n- Test coverage`,
    };

    const result = await agent.execute(reviewTask, context);

    // 解析审查结果
    return this.parseReviewResult(result.output);
  }

  /**
   * 解析审查结果
   */
  private parseReviewResult(output: string): ReviewResult {
    const issues: ReviewIssue[] = [];

    // 简单的解析逻辑（实际应该从 agent 输出中提取）
    const approved = output.includes("APPROVED") || output.includes("✅");

    // 尝试提取常见问题
    if (output.includes("security") || output.includes("安全")) {
      issues.push({
        severity: "critical",
        title: "Security Vulnerability",
        description: "Potential security issue detected",
        suggestion: "Review and fix security concerns",
      });
    }

    if (output.includes("performance") || output.includes("性能")) {
      issues.push({
        severity: "important",
        title: "Performance Issue",
        description: "Code may have performance problems",
        suggestion: "Optimize the implementation",
      });
    }

    if (output.includes("test") || output.includes("测试")) {
      issues.push({
        severity: "important",
        title: "Insufficient Tests",
        description: "Test coverage is inadequate",
        suggestion: "Add more comprehensive tests",
      });
    }

    if (output.includes("naming") || output.includes("命名")) {
      issues.push({
        severity: "minor",
        title: "Naming Convention",
        description: "Some names don't follow conventions",
        suggestion: "Improve variable/function names",
      });
    }

    const summary = approved
      ? "Code quality meets standards"
      : `Found ${issues.length} issue(s) that should be addressed`;

    return {
      approved: this.shouldApprove(issues),
      issues,
      summary,
    };
  }
}
