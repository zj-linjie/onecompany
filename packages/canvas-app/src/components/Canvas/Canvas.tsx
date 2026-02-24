/**
 * 主画布组件
 */

import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useCanvasStore } from '../../store/canvasStore';
import { SkillNode } from './SkillNode';
import { AgentNode } from './AgentNode';
import { ProjectNode } from './ProjectNode';

const nodeTypes = {
  skill: SkillNode,
  agent: AgentNode,
  project: ProjectNode,
};

export function Canvas() {
  const { nodes: storeNodes, connections, addConnection, addNode } = useCanvasStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 同步 store 中的节点到 React Flow
  useEffect(() => {
    const flowNodes: Node[] = storeNodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node,
    }));
    setNodes(flowNodes);
  }, [storeNodes, setNodes]);

  // 同步 store 中的连接到 React Flow
  useEffect(() => {
    const flowEdges: Edge[] = connections.map((conn) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      type: 'smoothstep',
      animated: conn.style?.animated ?? conn.enabled,
      style: {
        stroke: conn.style?.color ?? (conn.enabled ? '#10b981' : '#6b7280'),
        strokeWidth: conn.style?.width ?? 2,
      },
    }));
    setEdges(flowEdges);
  }, [connections, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newConnection = {
        id: `conn-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        type: 'skill-to-project' as const,
        enabled: true,
      };

      addConnection(newConnection);
      setEdges((eds) => addEdge(connection, eds));
    },
    [addConnection, setEdges]
  );

  // 处理拖放到画布
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));

        // 获取画布坐标
        const reactFlowBounds = (e.target as HTMLElement).getBoundingClientRect();
        const position = {
          x: e.clientX - reactFlowBounds.left - 100,
          y: e.clientY - reactFlowBounds.top - 50,
        };

        if (data.type === 'skill' && data.skill) {
          const skill = data.skill;

          // 创建新 Skill 节点
          const newNode = {
            id: `skill-${Date.now()}`,
            type: 'skill' as const,
            skillId: skill.id,
            name: skill.name,
            description: skill.description,
            enabled: true,
            position,
            connections: [],
          };

          addNode(newNode);
        } else if (data.type === 'agent' && data.agent) {
          const agent = data.agent;

          // 创建新 Agent 节点
          const newNode = {
            id: `agent-${Date.now()}`,
            type: 'agent' as const,
            role: agent.role,
            name: agent.name,
            skills: agent.defaultSkills,
            enabled: true,
            position,
            specialization: agent.specialization,
          };

          addNode(newNode);
        }
      } catch (error) {
        console.error('Failed to parse drop data:', error);
      }
    },
    [addNode]
  );

  return (
    <div
      className="w-full h-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Background color="#374151" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'skill':
                return '#3b82f6';
              case 'agent':
                return '#8b5cf6';
              case 'project':
                return '#10b981';
              default:
                return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}
