/**
 * Project 节点组件
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { FolderOpen } from 'lucide-react';
import type { ProjectNode as ProjectNodeType } from '../../types/canvas.types';

export const ProjectNode = memo(({ data }: NodeProps<ProjectNodeType>) => {
  const handleDoubleClick = () => {
    // 触发配置面板（通过自定义事件）
    window.dispatchEvent(new CustomEvent('openNodeConfig', { detail: data }));
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="
        px-6 py-4 rounded-xl border-2 shadow-xl min-w-[280px] cursor-pointer
        bg-green-500/10 border-green-500
      "
      title="Double-click to configure"
    >
      <Handle type="target" position={Position.Left} className="w-4 h-4" />

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-500/20">
          <FolderOpen className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <div className="font-bold text-lg">{data.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{data.path}</div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-blue-400">
              Skills: {data.activeSkills.length}
            </span>
            <span className="text-purple-400">
              Agents: {data.activeAgents.length}
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4" />
    </div>
  );
});

ProjectNode.displayName = 'ProjectNode';
