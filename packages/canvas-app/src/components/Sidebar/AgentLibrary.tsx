/**
 * Agent Library 组件
 */

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { agentsData, agentCategories, type Agent } from '../../data/agents';
import { useCanvasStore } from '../../store/canvasStore';

export function AgentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['development'])
  );
  const { addNode } = useCanvasStore();

  // 过滤 agents
  const filteredAgents = useMemo(() => {
    if (!searchQuery) return agentsData;
    const query = searchQuery.toLowerCase();
    return agentsData.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.specialization.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 按类别分组
  const agentsByCategory = useMemo(() => {
    const grouped: Record<string, Agent[]> = {};
    Object.entries(agentCategories).forEach(([categoryId, category]) => {
      grouped[categoryId] = filteredAgents.filter((agent) =>
        category.agents.includes(agent.id)
      );
    });
    return grouped;
  }, [filteredAgents]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, agent: Agent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'agent',
      agent,
    }));
  };

  const handleAddAgent = (agent: Agent) => {
    // 在画布右侧添加新 Agent 节点
    const newNode = {
      id: `agent-${Date.now()}`,
      type: 'agent' as const,
      role: agent.role,
      name: agent.name,
      skills: agent.defaultSkills,
      enabled: true,
      position: {
        x: Math.random() * 300 + 600,
        y: Math.random() * 400 + 100,
      },
      specialization: agent.specialization,
    };
    addNode(newNode);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg
                     text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {Object.entries(agentCategories).map(([categoryId, category]) => {
          const agents = agentsByCategory[categoryId] || [];
          if (agents.length === 0) return null;

          return (
            <div key={categoryId} className="mb-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                         hover:bg-accent transition-colors text-left"
              >
                <span className="text-lg">{category.icon}</span>
                <span className="flex-1 font-medium text-sm">
                  {category.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {agents.length}
                </span>
                <span className="text-muted-foreground">
                  {expandedCategories.has(categoryId) ? '▼' : '▶'}
                </span>
              </button>

              {/* Agents in Category */}
              {expandedCategories.has(categoryId) && (
                <div className="mt-1 space-y-1">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, agent)}
                      onClick={() => handleAddAgent(agent)}
                      className="ml-4 px-3 py-3 rounded-lg bg-background border border-border
                               hover:border-purple-500 hover:bg-purple-500/5 cursor-move
                               transition-all group"
                      title="Drag to canvas or click to add"
                      style={{
                        borderLeftWidth: '3px',
                        borderLeftColor: agent.color,
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl mt-0.5">{agent.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold group-hover:text-purple-400 transition-colors">
                            {agent.name}
                          </div>
                          <div className="text-xs text-purple-300 mt-0.5">
                            {agent.specialization}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {agent.description}
                          </div>

                          {/* Recommended For */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {agent.recommendedFor.slice(0, 2).map((rec, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300"
                              >
                                {rec}
                              </span>
                            ))}
                            {agent.recommendedFor.length > 2 && (
                              <span className="text-xs px-2 py-0.5 text-muted-foreground">
                                +{agent.recommendedFor.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Default Skills Count */}
                          <div className="mt-2 text-xs text-muted-foreground">
                            📦 {agent.defaultSkills.length} default skills
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredAgents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No agents found
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          🤖 Drag agents to canvas or click to add
        </div>
      </div>
    </div>
  );
}
