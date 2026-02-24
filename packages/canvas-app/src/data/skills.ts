/**
 * Skills 数据定义
 * 从 skill-factory 生成的真实 Skills
 */

import skillsGenerated from './skills-generated.json';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'backend' | 'frontend' | 'testing' | 'devops' | 'documentation' | 'tools' | 'architecture' | 'general';
  icon: string;
  source?: string;
}

// 从生成的数据加载真实 Skills
export const skillsData: Skill[] = skillsGenerated.skills.map((skill: any) => ({
  id: skill.id,
  name: skill.name,
  description: skill.description,
  category: skill.category as Skill['category'],
  icon: skill.icon,
  source: skill.source,
}));

// 按类别分组的 Skills
export const skillsByCategory = skillsGenerated.byCategory;

// 获取所有类别
export const categories = skillsGenerated.categories;

// 统计信息
export const skillsStats = {
  total: skillsGenerated.totalSkills,
  sources: skillsGenerated.sources,
  generatedAt: skillsGenerated.generatedAt,
};

// 搜索 Skills
export function searchSkills(query: string): Skill[] {
  const lowerQuery = query.toLowerCase();
  return skillsData.filter(
    (skill) =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.id.toLowerCase().includes(lowerQuery)
  );
}

// 按类别获取 Skills
export function getSkillsByCategory(category: string): Skill[] {
  return skillsData.filter((skill) => skill.category === category);
}

// 获取推荐的 Skills
export function getRecommendedSkills(projectType: 'frontend' | 'backend' | 'fullstack'): Skill[] {
  if (projectType === 'frontend') {
    return skillsData.filter((s) =>
      s.category === 'frontend' || s.category === 'testing' || s.category === 'devops'
    );
  }
  if (projectType === 'backend') {
    return skillsData.filter((s) =>
      s.category === 'backend' || s.category === 'testing' || s.category === 'devops'
    );
  }
  // fullstack
  return skillsData.filter((s) =>
    s.category === 'frontend' ||
    s.category === 'backend' ||
    s.category === 'testing' ||
    s.category === 'devops'
  );
}
