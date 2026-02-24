/**
 * Skill 节点组件
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Package, Power, PowerOff } from 'lucide-react';
import type { SkillNode as SkillNodeType } from '../../types/canvas.types';
import { useCanvasStore } from '../../store/canvasStore';

export const SkillNode = memo(({ data }: NodeProps<SkillNodeType>) => {
  const { updateNode, setSelectedNodeId } = useCanvasStore();

  const toggleEnabled = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNode(data.id, { enabled: !data.enabled });
  };

  const handleClick = () => {
    setSelectedNodeId(data.id);
    window.dispatchEvent(new CustomEvent('selectNode', { detail: data.id }));
  };

  const handleDoubleClick = () => {
    // 触发配置面板（通过自定义事件）
    window.dispatchEvent(new CustomEvent('openNodeConfig', { detail: data }));
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`
        px-4 py-3 rounded-lg border-2 shadow-lg min-w-[200px] cursor-pointer
        transition-all hover:shadow-xl
        ${data.enabled
          ? 'bg-blue-500/10 border-blue-500'
          : 'bg-gray-500/10 border-gray-500'
        }
      `}
      title="Double-click to configure"
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Package className="w-5 h-5 text-blue-400" />
          <div>
            <div className="font-semibold text-sm">{data.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.description}
            </div>
          </div>
        </div>

        <button
          onClick={toggleEnabled}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          title={data.enabled ? 'Disable' : 'Enable'}
        >
          {data.enabled ? (
            <Power className="w-4 h-4 text-green-400" />
          ) : (
            <PowerOff className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
});

SkillNode.displayName = 'SkillNode';
