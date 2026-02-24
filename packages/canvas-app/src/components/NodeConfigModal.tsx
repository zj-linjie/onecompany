/**
 * 节点配置弹窗组件
 */

import { useState, useEffect } from 'react';
import { X, Trash2, Power, PowerOff } from 'lucide-react';
import type { CanvasNode } from '../types/canvas.types';
import { useCanvasStore } from '../store/canvasStore';

interface NodeConfigModalProps {
  node: CanvasNode;
  onClose: () => void;
}

export function NodeConfigModal({ node, onClose }: NodeConfigModalProps) {
  const { updateNode, removeNode, connections } = useCanvasStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
  });

  useEffect(() => {
    // 初始化表单数据
    if (node.type === 'skill') {
      setFormData({
        name: node.name,
        description: node.description,
        enabled: node.enabled,
      });
    } else if (node.type === 'agent') {
      setFormData({
        name: node.name,
        description: node.specialization,
        enabled: node.enabled,
      });
    } else if (node.type === 'project') {
      setFormData({
        name: node.name,
        description: node.path,
        enabled: true,
      });
    }
  }, [node]);

  const handleSave = () => {
    if (node.type === 'skill') {
      updateNode(node.id, {
        name: formData.name,
        description: formData.description,
        enabled: formData.enabled,
      });
    } else if (node.type === 'agent') {
      updateNode(node.id, {
        name: formData.name,
        specialization: formData.description,
        enabled: formData.enabled,
      });
    } else if (node.type === 'project') {
      updateNode(node.id, {
        name: formData.name,
        path: formData.description,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${formData.name}"?`)) {
      removeNode(node.id);
      onClose();
    }
  };

  const toggleEnabled = () => {
    setFormData((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  // 获取节点的连接信息
  const nodeConnections = connections.filter(
    (conn) => conn.source === node.id || conn.target === node.id
  );

  const getNodeTypeLabel = () => {
    switch (node.type) {
      case 'skill':
        return '🔵 Skill Node';
      case 'agent':
        return '🟣 Agent Node';
      case 'project':
        return '🟢 Project Node';
      default:
        return 'Node';
    }
  };

  const getNodeTypeColor = () => {
    switch (node.type) {
      case 'skill':
        return 'border-blue-500';
      case 'agent':
        return 'border-purple-500';
      case 'project':
        return 'border-green-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`
          bg-secondary border-2 ${getNodeTypeColor()} rounded-xl shadow-2xl
          w-full max-w-md max-h-[90vh] overflow-y-auto
          animate-in zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">{getNodeTypeLabel()}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {node.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter name"
            />
          </div>

          {/* Description / Specialization / Path */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {node.type === 'skill' && 'Description'}
              {node.type === 'agent' && 'Specialization'}
              {node.type === 'project' && 'Path'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
              placeholder={`Enter ${node.type === 'skill' ? 'description' : node.type === 'agent' ? 'specialization' : 'path'}`}
            />
          </div>

          {/* Enabled Toggle (not for project) */}
          {node.type !== 'project' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <button
                onClick={toggleEnabled}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
                  ${formData.enabled
                    ? 'bg-green-500/10 border-green-500 text-green-400'
                    : 'bg-gray-500/10 border-gray-500 text-gray-400'
                  }
                `}
              >
                {formData.enabled ? (
                  <>
                    <Power className="w-4 h-4" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <PowerOff className="w-4 h-4" />
                    <span>Disabled</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Additional Info */}
          {node.type === 'skill' && 'skillId' in node && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Skill ID
              </label>
              <div className="px-3 py-2 bg-background border border-border rounded-lg text-muted-foreground">
                {node.skillId}
              </div>
            </div>
          )}

          {node.type === 'agent' && 'role' in node && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Role
              </label>
              <div className="px-3 py-2 bg-background border border-border rounded-lg text-muted-foreground">
                {node.role}
              </div>
            </div>
          )}

          {node.type === 'agent' && 'skills' in node && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Skills ({node.skills.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {node.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Connections */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Connections ({nodeConnections.length})
            </label>
            {nodeConnections.length > 0 ? (
              <div className="space-y-2">
                {nodeConnections.map((conn) => (
                  <div
                    key={conn.id}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className={conn.enabled ? 'text-green-400' : 'text-gray-400'}>
                        {conn.enabled ? '●' : '○'}
                      </span>
                      <span className="text-muted-foreground">
                        {conn.source === node.id ? '→' : '←'}
                      </span>
                      <span>
                        {conn.source === node.id ? conn.target : conn.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground">
                No connections
              </div>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <span className="text-muted-foreground">X:</span> {Math.round(node.position.x)}
              </div>
              <div className="px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <span className="text-muted-foreground">Y:</span> {Math.round(node.position.y)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30
                     rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg
                       hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg
                       hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
