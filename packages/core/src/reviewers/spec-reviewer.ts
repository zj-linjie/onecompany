/**
 * 规格审查器
 * 验证实现是否符合任务规格
 */

import type { Task, AgentContext } from "../types.js";
import { BaseReviewer, type ReviewResult, type ReviewIssue } from "./base-reviewer.js";
import { createAgentExecutor } from "../subagent-executor.js";

export class SpecReviewer extends BaseReviewer {
  constructor() {
    super("spec-reviewer-" + Date.now(), "spec-reviewer", ["requirement-analysis", "acceptance-testing"]);
  }

  protected async review(task: Task, context: AgentContext): Promise<ReviewResult> {
    // 使用 spec-reviewer agent 进行审查
    const agent = createAgentExecutor("spec-reviewer");

    // 构建审查任务
    const reviewTask: Task = {
      ...task,
      id: `review-${task.id}`,
      title: `Review: ${task.title}`,
      description: `Review the implementation of task "${task.title}" against its specification.\n\n**Original Task**:\n${task.description}\n\n**Implementation Result**:\n${task.result?.output || "No output available"}`,
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
    // 这里先返回一个模拟结果
    const approved = output.includes("APPROVED") || output.includes("✅");

    // 尝试提取问题
    if (output.includes("Missing Requirements") || output.includes("缺失需求")) {
      issues.push({
        severity: "critical",
        title: "Missing Requirements",
        description: "Some requirements from the spec are not implemented",
        suggestion: "Implement all required features",
      });
    }

    if (output.includes("Extra Features") || output.includes("额外功能")) {
      issues.push({
        severity: "important",
        title: "Extra Features",
        description: "Implementation includes features not in the spec",
        suggestion: "Remove or justify extra features",
      });
    }

    const summary = approved
      ? "Implementation matches specification"
      : `Found ${issues.length} issue(s) that need to be addressed`;

    return {
      approved: this.shouldApprove(issues),
      issues,
      summary,
    };
  }
}
