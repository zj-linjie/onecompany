/**
 * Agent 管理器
 * 负责管理和协调多个 agent
 */

import type { AgentRole } from "./types.js";
import { createAgentExecutor, SubagentExecutor } from "./subagent-executor.js";

export class AgentManager {
  private agents = new Map<AgentRole, SubagentExecutor>();

  /**
   * 获取或创建指定角色的 agent
   */
  getAgent(role: AgentRole): SubagentExecutor {
    let agent = this.agents.get(role);
    if (!agent) {
      agent = createAgentExecutor(role);
      this.agents.set(role, agent);
    }
    return agent;
  }

  /**
   * 获取所有已创建的 agent
   */
  getAllAgents(): SubagentExecutor[] {
    return Array.from(this.agents.values());
  }

  /**
   * 清除所有 agent
   */
  clear(): void {
    this.agents.clear();
  }

  /**
   * 获取 agent 统计信息
   */
  getStats(): {
    totalAgents: number;
    agentsByRole: Record<AgentRole, number>;
  } {
    const agentsByRole: Record<string, number> = {};
    for (const [role] of this.agents) {
      agentsByRole[role] = (agentsByRole[role] || 0) + 1;
    }

    return {
      totalAgents: this.agents.size,
      agentsByRole: agentsByRole as Record<AgentRole, number>,
    };
  }
}
