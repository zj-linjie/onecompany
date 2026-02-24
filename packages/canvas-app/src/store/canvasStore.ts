/**
 * Canvas 状态管理 (Zustand)
 */

import { create } from 'zustand';
import type { CanvasNode, Connection, ProjectNode } from '../types/canvas.types';

interface CanvasState {
  // 节点
  nodes: CanvasNode[];
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  removeNode: (id: string) => void;
  clearNodes: () => void;

  // 连接
  connections: Connection[];
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;

  // 项目
  project: ProjectNode | null;
  setProject: (project: ProjectNode) => void;

  // 选中状态
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // 配置
  loadConfig: (config: any) => void;
  saveConfig: () => any;
  resetCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // 初始状态
  nodes: [],
  connections: [],
  project: null,
  selectedNodeId: null,

  // 节点操作
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node] as CanvasNode[],
  })),

  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, ...updates } as CanvasNode : node
    ),
  })),

  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    connections: state.connections.filter(
      (conn) => conn.source !== id && conn.target !== id
    ),
  })),

  clearNodes: () => set({ nodes: [] }),

  // 连接操作
  addConnection: (connection) => set((state) => ({
    connections: [...state.connections, connection],
  })),

  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter((conn) => conn.id !== id),
  })),

  // 项目操作
  setProject: (project) => set({ project }),

  // 选中状态
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  // 配置管理
  loadConfig: (config) => set({
    project: config.project,
    nodes: config.nodes || [],
    connections: config.connections || [],
  }),

  saveConfig: () => {
    const state = get();
    return {
      version: '1.0.0',
      project: state.project,
      nodes: state.nodes,
      connections: state.connections,
    };
  },

  // 重置画布
  resetCanvas: () => set({
    nodes: [],
    connections: [],
    project: null,
    selectedNodeId: null,
  }),
}));
