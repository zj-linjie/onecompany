/**
 * 审查器基类
 * 提供通用的审查功能
 */

import type { Task, TaskResult, AgentContext } from "../types.js";
import { BaseAgent } from "../agent.js";

export interface ReviewResult {
  approved: boolean;
  issues: ReviewIssue[];
  summary: string;
}

export interface ReviewIssue {
  severity: "critical" | "important" | "minor";
  title: string;
  description: string;
  location?: string;
  suggestion?: string;
}

export abstract class BaseReviewer extends BaseAgent {
  /**
   * 执行审查
   */
  async execute(task: Task, context: AgentContext): Promise<TaskResult> {
    try {
      const reviewResult = await this.review(task, context);

      return {
        success: reviewResult.approved,
        output: this.formatReviewOutput(reviewResult),
        artifacts: [],
        nextSteps: reviewResult.approved ? [] : ["Fix issues and re-submit for review"],
      };
    } catch (error) {
      return {
        success: false,
        output: `Review failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 执行具体的审查逻辑（由子类实现）
   */
  protected abstract review(task: Task, context: AgentContext): Promise<ReviewResult>;

  /**
   * 格式化审查输出
   */
  protected formatReviewOutput(result: ReviewResult): string {
    let output = `## Review Result\n\n`;
    output += `**Status**: ${result.approved ? "✅ APPROVED" : "❌ NEEDS FIXES"}\n\n`;
    output += `**Summary**: ${result.summary}\n\n`;

    if (result.issues.length > 0) {
      const critical = result.issues.filter((i) => i.severity === "critical");
      const important = result.issues.filter((i) => i.severity === "important");
      const minor = result.issues.filter((i) => i.severity === "minor");

      if (critical.length > 0) {
        output += `### Critical Issues 🔴\n\n`;
        critical.forEach((issue, index) => {
          output += this.formatIssue(issue, index + 1);
        });
      }

      if (important.length > 0) {
        output += `### Important Issues 🟡\n\n`;
        important.forEach((issue, index) => {
          output += this.formatIssue(issue, index + 1);
        });
      }

      if (minor.length > 0) {
        output += `### Minor Issues 🟢\n\n`;
        minor.forEach((issue, index) => {
          output += this.formatIssue(issue, index + 1);
        });
      }
    } else {
      output += `### Issues\n\nNone - all checks passed! ✅\n\n`;
    }

    return output;
  }

  /**
   * 格式化单个问题
   */
  protected formatIssue(issue: ReviewIssue, index: number): string {
    let output = `${index}. **${issue.title}**\n`;
    output += `   - **Description**: ${issue.description}\n`;
    if (issue.location) {
      output += `   - **Location**: ${issue.location}\n`;
    }
    if (issue.suggestion) {
      output += `   - **Suggestion**: ${issue.suggestion}\n`;
    }
    output += `\n`;
    return output;
  }

  /**
   * 判断是否应该批准
   */
  protected shouldApprove(issues: ReviewIssue[]): boolean {
    // 有任何 critical 问题就不批准
    const hasCritical = issues.some((i) => i.severity === "critical");
    if (hasCritical) {
      return false;
    }

    // 有超过 3 个 important 问题也不批准
    const importantCount = issues.filter((i) => i.severity === "important").length;
    if (importantCount > 3) {
      return false;
    }

    return true;
  }
}
