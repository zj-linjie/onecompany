/**
 * 模板选择弹窗组件
 */

import { X } from 'lucide-react';
import { projectTemplates, templateCategories } from '../data/templates';
import type { ProjectTemplate } from '../data/templates';

interface TemplateModalProps {
  onSelect: (template: ProjectTemplate) => void;
  onClose: () => void;
}

export function TemplateModal({ onSelect, onClose }: TemplateModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-secondary border-2 border-primary rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-secondary z-10">
          <div>
            <h2 className="text-2xl font-bold">选择项目模板</h2>
            <p className="text-sm text-muted-foreground mt-1">
              快速开始常见的项目配置
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
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="text-left p-6 rounded-xl border-2 border-border hover:border-primary
                         bg-background hover:bg-accent transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {templateCategories[template.category].icon}{' '}
                        {templateCategories[template.category].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {template.config.nodes.length} 个节点
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Empty State */}
          <div className="mt-6 p-6 rounded-xl border-2 border-dashed border-border text-center">
            <div className="text-4xl mb-2">🎨</div>
            <h3 className="font-semibold mb-1">从空白画布开始</h3>
            <p className="text-sm text-muted-foreground mb-3">
              不使用模板，手动添加 Skills 和 Agents
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg
                       hover:bg-accent transition-colors"
            >
              关闭并继续
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
