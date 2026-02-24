/**
 * 主应用组件
 */

import { useEffect, useState } from 'react';
import { Canvas } from './components/Canvas/Canvas';
import { Sidebar } from './components/Sidebar/Sidebar';
import { SkillsCatalog } from './components/Sidebar/SkillsCatalog';
import { AgentLibrary } from './components/Sidebar/AgentLibrary';
import { Toast, type ToastType } from './components/Toast';
import { NodeConfigModal } from './components/NodeConfigModal';
import { TemplateModal } from './components/TemplateModal';
import { ProjectSelector } from './components/ProjectSelector';
import { useCanvasStore } from './store/canvasStore';
import { saveConfig, loadConfig, uploadConfig, validateConfig } from './utils/persistence';
import type { CanvasNode } from './types/canvas.types';
import type { ProjectTemplate } from './data/templates';

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

function App() {
  const { setProject, addNode, project, saveConfig: saveStoreConfig, loadConfig: loadStoreConfig, nodes, removeNode, resetCanvas } = useCanvasStore();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const [configNode, setConfigNode] = useState<CanvasNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(true); // 启动时显示项目选择器
  const [currentProjectPath, setCurrentProjectPath] = useState<string>('');
  const [currentProjectName, setCurrentProjectName] = useState<string>('');
  const [projectVersion, setProjectVersion] = useState(0); // 用于强制重新加载

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'info' });
  };

  useEffect(() => {
    // 监听节点配置事件
    const handleOpenNodeConfig = (e: Event) => {
      const customEvent = e as CustomEvent<CanvasNode>;
      setConfigNode(customEvent.detail);
    };

    // 监听节点选中事件
    const handleNodeSelect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSelectedNodeId(customEvent.detail);
    };

    // 键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete 键删除选中的节点
      if (e.key === 'Delete' && selectedNodeId) {
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node && confirm(`确定要删除 "${node.type === 'skill' ? node.name : node.type === 'agent' ? node.name : node.name}" 吗？`)) {
          removeNode(selectedNodeId);
          setSelectedNodeId(null);
          showToast('节点已删除', 'success');
        }
      }

      // Ctrl+Z / Cmd+Z 撤销（未来实现）
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        showToast('撤销功能开发中...', 'info');
      }
    };

    window.addEventListener('openNodeConfig', handleOpenNodeConfig);
    window.addEventListener('selectNode', handleNodeSelect);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('openNodeConfig', handleOpenNodeConfig);
      window.removeEventListener('selectNode', handleNodeSelect);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, nodes, removeNode]);

  useEffect(() => {
    // 只有在选择了项目后才初始化
    if (!currentProjectPath || !currentProjectName) {
      return;
    }

    // 清空画布
    console.log('Resetting canvas for new project:', currentProjectName);
    resetCanvas();

    // 初始化项目节点
    const projectNode = {
      id: 'project-1',
      type: 'project' as const,
      name: currentProjectName,
      path: currentProjectPath,
      activeSkills: [],
      activeAgents: [],
      position: { x: 400, y: 300 },
    };

    setProject(projectNode);
    addNode(projectNode);

    // 尝试加载保存的配置
    const workspacePath = projectNode.path;
    loadConfig(workspacePath).then((config) => {
      if (config && validateConfig(config)) {
        console.log('Loading existing config for:', currentProjectName);
        loadStoreConfig(config);
        showToast('配置加载成功', 'success');
        return;
      }

      console.log('No existing config, adding sample nodes');
      // 如果没有保存的配置，添加示例节点
      addNode({
        id: 'skill-1',
        type: 'skill',
        skillId: 'api-development',
        name: 'API Development',
        description: 'RESTful API design and implementation',
        enabled: true,
        position: { x: 100, y: 200 },
        connections: [],
      });

      addNode({
        id: 'skill-2',
        type: 'skill',
        skillId: 'react-dev',
        name: 'React Development',
        description: 'Modern React with hooks and TypeScript',
        enabled: true,
        position: { x: 100, y: 350 },
        connections: [],
      });

      addNode({
        id: 'agent-1',
        type: 'agent',
        role: 'backend-dev',
        name: 'Backend Developer',
        skills: ['api-development', 'database-design'],
        enabled: true,
        position: { x: 700, y: 200 },
        specialization: 'API and Database Expert',
      });

      addNode({
        id: 'agent-2',
        type: 'agent',
        role: 'frontend-dev',
        name: 'Frontend Developer',
        skills: ['react-dev', 'ui-design'],
        enabled: true,
        position: { x: 700, y: 400 },
        specialization: 'React and UI/UX Expert',
      });
    }).catch((error) => {
      console.error('Failed to load config:', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectPath, currentProjectName, projectVersion]);

  // 保存配置
  const handleSaveConfig = async () => {
    try {
      if (!project) {
        showToast('No project to save', 'error');
        return;
      }

      const config = saveStoreConfig();
      await saveConfig(config, project.path);
      showToast('Configuration saved successfully', 'success');
    } catch (error) {
      console.error('Save config error:', error);
      showToast('Failed to save configuration', 'error');
    }
  };

  // 加载配置
  const handleLoadConfig = async () => {
    try {
      const config = await uploadConfig();

      if (!validateConfig(config)) {
        showToast('Invalid configuration file', 'error');
        return;
      }

      loadStoreConfig(config);
      showToast('Configuration loaded successfully', 'success');
    } catch (error) {
      console.error('Load config error:', error);
      showToast('Failed to load configuration', 'error');
    }
  };

  // 加载模板
  const handleLoadTemplate = (template: ProjectTemplate) => {
    if (!project) return;

    // 清空现有节点（除了 project 节点）
    nodes.forEach(node => {
      if (node.type !== 'project') {
        removeNode(node.id);
      }
    });

    // 添加模板节点
    template.config.nodes.forEach(node => {
      addNode(node);
    });

    setShowTemplateModal(false);
    showToast(`已加载模板：${template.name}`, 'success');
  };

  // 处理项目选择
  const handleProjectSelect = (projectPath: string, projectName: string) => {
    console.log('Project selected:', projectName, projectPath);

    // 立即清空画布
    resetCanvas();

    // 然后设置新项目信息
    setCurrentProjectPath(projectPath);
    setCurrentProjectName(projectName);
    setShowProjectSelector(false);
    setProjectVersion(prev => prev + 1); // 强制重新加载

    showToast(`正在加载项目：${projectName}...`, 'info');
  };

  // 切换项目
  const handleChangeProject = () => {
    // 只保存到 localStorage，不触发下载
    if (project) {
      try {
        const config = saveStoreConfig();
        const configKey = `canvas-config-${project.path}`;
        localStorage.setItem(configKey, JSON.stringify(config, null, 2));
        console.log('Config saved to localStorage before switching project');
      } catch (error) {
        console.error('Failed to save config to localStorage:', error);
      }
    }
    setShowProjectSelector(true);
  };

  // 如果还没选择项目，显示项目选择器
  if (showProjectSelector) {
    return (
      <ProjectSelector
        onSelect={handleProjectSelect}
        onClose={() => {
          // 如果已经有项目，允许关闭
          if (currentProjectPath) {
            setShowProjectSelector(false);
          }
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Canvas Skill Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {currentProjectName ? `项目: ${currentProjectName}` : 'Drag and connect skills and agents to your project'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleChangeProject}
              className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              📁 切换项目
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              📋 加载模板
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              保存配置
            </button>
            <button
              onClick={handleLoadConfig}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
            >
              加载配置
            </button>
            {selectedNodeId && (
              <button
                onClick={() => {
                  const node = nodes.find(n => n.id === selectedNodeId);
                  if (node && confirm(`确定要删除 "${node.type === 'skill' ? node.name : node.type === 'agent' ? node.name : node.name}" 吗？`)) {
                    removeNode(selectedNodeId);
                    setSelectedNodeId(null);
                    showToast('节点已删除', 'success');
                  }
                }}
                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                删除节点
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Skills Catalog */}
        <Sidebar
          side="left"
          title="Skills Catalog"
          isOpen={isLeftSidebarOpen}
          onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        >
          <SkillsCatalog />
        </Sidebar>

        {/* Canvas */}
        <div className="flex-1">
          <Canvas />
        </div>

        {/* Right Sidebar - Agent Library */}
        <Sidebar
          side="right"
          title="Agent Library"
          isOpen={isRightSidebarOpen}
          onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        >
          <AgentLibrary />
        </Sidebar>
      </main>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border px-6 py-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>OneCompany Multi-Agent Framework v0.2.0</div>
          <div className="flex gap-4">
            <span>Drag skills from sidebar</span>
            <span>Press Space to pan</span>
            <span>Scroll to zoom</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Node Config Modal */}
      {configNode && (
        <NodeConfigModal
          node={configNode}
          onClose={() => setConfigNode(null)}
        />
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal
          onSelect={handleLoadTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}

export default App;
