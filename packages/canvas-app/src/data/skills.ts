/**
 * Skills 数据定义
 */

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'backend' | 'frontend' | 'testing' | 'devops' | 'design';
  icon: string;
}

export const skillsData: Skill[] = [
  // Backend Skills
  {
    id: 'api-development',
    name: 'API 开发',
    description: 'RESTful API 设计与实现，包括接口规范、版本控制',
    category: 'backend',
    icon: '🔧',
  },
  {
    id: 'database-design',
    name: '数据库设计',
    description: 'SQL 和 NoSQL 数据库架构设计，性能优化',
    category: 'backend',
    icon: '🗄️',
  },
  {
    id: 'authentication',
    name: '身份认证',
    description: 'JWT、OAuth 等认证方案，安全加密实现',
    category: 'backend',
    icon: '🔐',
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    description: 'GraphQL API 开发，查询优化和缓存策略',
    category: 'backend',
    icon: '📊',
  },

  // Frontend Skills
  {
    id: 'react-dev',
    name: 'React 开发',
    description: '现代 React 开发，Hooks、TypeScript、性能优化',
    category: 'frontend',
    icon: '⚛️',
  },
  {
    id: 'ui-design',
    name: 'UI/UX 设计',
    description: '用户界面和体验设计，交互原型，可用性测试',
    category: 'frontend',
    icon: '🎨',
  },
  {
    id: 'responsive-layout',
    name: '响应式布局',
    description: '移动优先的响应式设计，跨设备适配',
    category: 'frontend',
    icon: '📱',
  },
  {
    id: 'state-management',
    name: '状态管理',
    description: 'Redux、Zustand 等状态管理方案和最佳实践',
    category: 'frontend',
    icon: '🔄',
  },

  // Testing Skills
  {
    id: 'unit-testing',
    name: '单元测试',
    description: 'Jest、Vitest 单元测试开发，TDD 实践',
    category: 'testing',
    icon: '✅',
  },
  {
    id: 'integration-testing',
    name: '集成测试',
    description: 'API 和组件集成测试，端到端测试场景',
    category: 'testing',
    icon: '🔗',
  },
  {
    id: 'e2e-testing',
    name: 'E2E 测试',
    description: 'Playwright、Cypress 端到端自动化测试',
    category: 'testing',
    icon: '🎭',
  },

  // DevOps Skills
  {
    id: 'docker',
    name: 'Docker',
    description: '容器化部署，Docker Compose 编排',
    category: 'devops',
    icon: '🐳',
  },
  {
    id: 'ci-cd',
    name: 'CI/CD',
    description: '持续集成和部署，GitHub Actions、Jenkins',
    category: 'devops',
    icon: '🔄',
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description: '容器编排，K8s 集群管理和服务部署',
    category: 'devops',
    icon: '☸️',
  },

  // Design Skills
  {
    id: 'figma',
    name: 'Figma 设计',
    description: 'UI 设计和原型制作，设计系统搭建',
    category: 'design',
    icon: '🎨',
  },
  {
    id: 'design-system',
    name: '设计系统',
    description: '组件库和设计规范，Design Tokens 管理',
    category: 'design',
    icon: '📐',
  },
];

export const categoryLabels = {
  backend: 'Backend Skills',
  frontend: 'Frontend Skills',
  testing: 'Testing Skills',
  devops: 'DevOps Skills',
  design: 'Design Skills',
};

export const categoryIcons = {
  backend: '📦',
  frontend: '🎨',
  testing: '🧪',
  devops: '🔧',
  design: '✨',
};
