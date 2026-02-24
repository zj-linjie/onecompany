/**
 * 项目选择器组件
 */

import { useState, useEffect } from 'react';
import { FolderOpen, X } from 'lucide-react';

interface Project {
  name: string;
  path: string;
  hasConfig: boolean;
}

interface ProjectSelectorProps {
  onSelect: (projectPath: string, projectName: string) => void;
  onClose: () => void;
}

export function ProjectSelector({ onSelect, onClose }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customPath, setCustomPath] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 扫描 workspaces 目录
    scanWorkspaces();
  }, []);

  const scanWorkspaces = async () => {
    try {
      // 这里我们使用一个简单的方法：让用户输入项目路径
      // 在实际应用中，可以通过 Electron 或其他方式扫描文件系统
      const defaultProjects: Project[] = [
        {
          name: 'canvas-skill-manager',
          path: '/Users/apple/dev/onecompany/workspaces/canvas-skill-manager',
          hasConfig: true,
        },
        {
          name: 'onecompany-demo',
          path: '/Users/apple/dev/onecompany/workspaces/onecompany-demo',
          hasConfig: false,
        },
        {
          name: 'iron-term2',
          path: '/Users/apple/dev/onecompany/workspaces/iron-term2',
          hasConfig: false,
        },
      ];

      setProjects(defaultProjects);
      setLoading(false);
    } catch (error) {
      console.error('Failed to scan workspaces:', error);
      setLoading(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    onSelect(project.path, project.name);
  };

  const handleCustomPath = () => {
    if (!customPath) return;

    const projectName = customPath.split('/').pop() || 'custom-project';
    onSelect(customPath, projectName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-secondary border-2 border-primary rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-secondary z-10">
          <div>
            <h2 className="text-2xl font-bold">选择项目</h2>
            <p className="text-sm text-muted-foreground mt-1">
              选择要配置的工作空间项目
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
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">扫描项目中...</p>
            </div>
          ) : (
            <>
              {/* 可用项目列表 */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  可用项目
                </h3>
                {projects.map((project) => (
                  <button
                    key={project.path}
                    onClick={() => handleSelectProject(project)}
                    className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary
                             bg-background hover:bg-accent transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <FolderOpen className="w-6 h-6 text-primary mt-1" />
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {project.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 font-mono">
                          {project.path}
                        </p>
                        {project.hasConfig && (
                          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                            ✓ 已有配置
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* 自定义路径 */}
              <div className="mt-6 p-4 rounded-xl border-2 border-dashed border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                  自定义项目路径
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="/path/to/your/project"
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg
                             focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleCustomPath}
                    disabled={!customPath}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg
                             hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    打开
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  输入项目的绝对路径，例如：/Users/apple/dev/onecompany/workspaces/my-project
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
