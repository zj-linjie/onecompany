/**
 * 审查管理器
 * 协调两阶段审查流程
 */

import type { Task, AgentContext } from "../types.js";
import { SpecReviewer } from "./spec-reviewer.js";
import { CodeReviewer } from "./code-reviewer.js";
import type { ReviewResult } from "./base-reviewer.js";

export interface TwoStageReviewResult {
  specReview: ReviewResult;
  codeReview?: ReviewResult;
  overallApproved: boolean;
  summary: string;
}

export class ReviewManager {
  private specReviewer = new SpecReviewer();
  private codeReviewer = new CodeReviewer();

  /**
   * 执行两阶段审查
   */
  async performTwoStageReview(
    task: Task,
    context: AgentContext
  ): Promise<TwoStageReviewResult> {
    console.log(`[ReviewManager] Starting two-stage review for task: ${task.title}`);

    // Stage 1: 规格审查
    console.log(`[ReviewManager] Stage 1: Spec Review`);
    const specResult = await this.specReviewer.execute(task, context);
    const specReview = this.parseReviewFromOutput(specResult.output);

    // 如果规格审查不通过，不进行代码审查
    if (!specReview.approved) {
      console.log(`[ReviewManager] Spec review failed, skipping code review`);
      return {
        specReview,
        overallApproved: false,
        summary: "Spec review failed - implementation does not match requirements",
      };
    }

    // Stage 2: 代码质量审查
    console.log(`[ReviewManager] Stage 2: Code Review`);
    const codeResult = await this.codeReviewer.execute(task, context);
    const codeReview = this.parseReviewFromOutput(codeResult.output);

    const overallApproved = specReview.approved && codeReview.approved;

    return {
      specReview,
      codeReview,
      overallApproved,
      summary: overallApproved
        ? "Both spec and code reviews passed"
        : "Code review found issues that need to be addressed",
    };
  }

  /**
   * 从输出中解析审查结果
   */
  private parseReviewFromOutput(output: string): ReviewResult {
    // 简单的解析逻辑
    const approved = output.includes("✅ APPROVED");
    const issueCount = (output.match(/\d+\./g) || []).length;

    return {
      approved,
      issues: [], // 实际应该解析出具体问题
      summary: approved ? "Review passed" : `Found ${issueCount} issues`,
    };
  }

  /**
   * 格式化两阶段审查结果
   */
  formatReviewResult(result: TwoStageReviewResult): string {
    let output = `## Two-Stage Review Result\n\n`;
    output += `**Overall Status**: ${result.overallApproved ? "✅ APPROVED" : "❌ NEEDS FIXES"}\n\n`;
    output += `**Summary**: ${result.summary}\n\n`;

    output += `### Stage 1: Spec Review\n`;
    output += `Status: ${result.specReview.approved ? "✅ Passed" : "❌ Failed"}\n`;
    output += `Issues: ${result.specReview.issues.length}\n\n`;

    if (result.codeReview) {
      output += `### Stage 2: Code Review\n`;
      output += `Status: ${result.codeReview.approved ? "✅ Passed" : "❌ Failed"}\n`;
      output += `Issues: ${result.codeReview.issues.length}\n\n`;
    } else {
      output += `### Stage 2: Code Review\n`;
      output += `Status: ⏭️ Skipped (spec review failed)\n\n`;
    }

    return output;
  }
}
