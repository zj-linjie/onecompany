/**
 * Agents 数据定义
 */

export interface Agent {
  id: string;
  name: string;
  role: string;
  specialization: string;
  description: string;
  recommendedFor: string[];
  defaultSkills: string[];
  icon: string;
  color: string;
}

export const agentsData: Agent[] = [
  {
    id: 'backend-developer',
    name: '后端开发工程师',
    role: 'backend-dev',
    specialization: 'API 和数据库专家',
    description: '专注于服务端开发、API 设计和数据库架构，精通 Node.js、Python、Java 等后端技术栈',
    recommendedFor: ['API 开发', '数据库设计', '身份认证', 'GraphQL'],
    defaultSkills: ['api-development', 'database-design', 'authentication'],
    icon: '👨‍💻',
    color: '#8b5cf6',
  },
  {
    id: 'frontend-developer',
    name: '前端开发工程师',
    role: 'frontend-dev',
    specialization: 'React 和 UI/UX 专家',
    description: '精通现代前端框架、响应式设计和用户体验优化，擅长 React、Vue、TypeScript',
    recommendedFor: ['React 开发', 'UI/UX 设计', '响应式布局', '状态管理'],
    defaultSkills: ['react-dev', 'ui-design', 'responsive-layout'],
    icon: '👩‍💻',
    color: '#3b82f6',
  },
  {
    id: 'fullstack-developer',
    name: '全栈开发工程师',
    role: 'fullstack-dev',
    specialization: '端到端全栈开发',
    description: '全能型开发者，能够独立完成前后端开发，适合快速原型和小团队',
    recommendedFor: ['全栈应用开发', '快速原型', '小型团队', 'MVP 开发'],
    defaultSkills: ['api-development', 'react-dev', 'database-design'],
    icon: '🧑‍💻',
    color: '#10b981',
  },
  {
    id: 'devops-engineer',
    name: 'DevOps 工程师',
    role: 'devops',
    specialization: 'CI/CD 和基础设施',
    description: '管理部署流水线、容器编排和云基础设施，确保系统稳定运行',
    recommendedFor: ['部署自动化', 'CI/CD', 'Docker', 'Kubernetes', '云基础设施'],
    defaultSkills: ['docker', 'ci-cd', 'kubernetes'],
    icon: '🔧',
    color: '#f59e0b',
  },
  {
    id: 'qa-engineer',
    name: '测试工程师',
    role: 'qa',
    specialization: '质量保证专家',
    description: '通过全面的测试策略确保代码质量，包括单元测试、集成测试和自动化测试',
    recommendedFor: ['单元测试', '集成测试', 'E2E 测试', '测试自动化'],
    defaultSkills: ['unit-testing', 'integration-testing', 'e2e-testing'],
    icon: '🧪',
    color: '#ec4899',
  },
  {
    id: 'security-expert',
    name: '安全专家',
    role: 'security',
    specialization: '应用安全专家',
    description: '专注于安全审计、渗透测试和安全编码实践，保护应用免受攻击',
    recommendedFor: ['安全审计', '身份认证', '数据保护', '合规性检查'],
    defaultSkills: ['authentication'],
    icon: '🛡️',
    color: '#ef4444',
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX 设计师',
    role: 'designer',
    specialization: '用户体验设计专家',
    description: '创建直观的界面和愉悦的用户体验，精通 Figma、Sketch 等设计工具',
    recommendedFor: ['UI 设计', 'UX 研究', '原型设计', '设计系统'],
    defaultSkills: ['ui-design', 'figma', 'design-system'],
    icon: '🎨',
    color: '#a855f7',
  },
  {
    id: 'data-engineer',
    name: '数据工程师',
    role: 'data',
    specialization: '数据管道和分析',
    description: '构建数据管道、管理数据库，支持数据驱动的决策，精通 ETL 和数据分析',
    recommendedFor: ['数据库设计', '数据处理', '数据分析', 'ETL'],
    defaultSkills: ['database-design'],
    icon: '📊',
    color: '#06b6d4',
  },
  {
    id: 'performance-optimizer',
    name: '性能优化专家',
    role: 'performance',
    specialization: '速度和效率优化',
    description: '优化应用性能、减少加载时间、提升可扩展性，精通性能分析和调优',
    recommendedFor: ['性能调优', '缓存策略', '负载优化', '监控告警'],
    defaultSkills: ['react-dev', 'api-development'],
    icon: '⚡',
    color: '#eab308',
  },
  {
    id: 'mobile-developer',
    name: '移动端开发工程师',
    role: 'mobile',
    specialization: 'iOS 和 Android 开发',
    description: '开发原生和跨平台移动应用，精通 React Native、Flutter、Swift、Kotlin',
    recommendedFor: ['移动应用', 'React Native', 'iOS', 'Android'],
    defaultSkills: ['react-dev', 'responsive-layout'],
    icon: '📱',
    color: '#14b8a6',
  },
];

export const agentCategories = {
  development: {
    label: 'Development',
    icon: '💻',
    agents: ['backend-developer', 'frontend-developer', 'fullstack-developer', 'mobile-developer'],
  },
  operations: {
    label: 'Operations',
    icon: '⚙️',
    agents: ['devops-engineer', 'performance-optimizer'],
  },
  quality: {
    label: 'Quality & Security',
    icon: '🔒',
    agents: ['qa-engineer', 'security-expert'],
  },
  design: {
    label: 'Design & Data',
    icon: '🎨',
    agents: ['ui-ux-designer', 'data-engineer'],
  },
};
