/**
 * Canvas 应用类型定义
 */

export type NodeType = 'skill' | 'agent' | 'project';

export interface Position {
  x: number;
  y: number;
}

export interface SkillNode {
  id: string;
  type: 'skill';
  skillId: string;
  name: string;
  description: string;
  enabled: boolean;
  position: Position;
  connections: string[];
}

export interface AgentNode {
  id: string;
  type: 'agent';
  role: string;
  name: string;
  skills: string[];
  enabled: boolean;
  position: Position;
  specialization: string;
}

export interface ProjectNode {
  id: string;
  type: 'project';
  name: string;
  path: string;
  activeSkills: string[];
  activeAgents: string[];
  position: Position;
}

export type CanvasNode = SkillNode | AgentNode | ProjectNode;

export type ConnectionType = 'skill-to-project' | 'agent-to-project' | 'skill-to-agent';

export interface Connection {
  id: string;
  source: string;
  target: string;
  type: ConnectionType;
  enabled: boolean;
  style?: {
    color?: string;
    width?: number;
    animated?: boolean;
  };
}

export interface CanvasConfig {
  version: string;
  project: ProjectNode;
  nodes: CanvasNode[];
  connections: Connection[];
}
