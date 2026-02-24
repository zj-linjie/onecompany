/**
 * Skills Catalog 组件
 */

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { skillsData, categoryLabels, categoryIcons, type Skill } from '../../data/skills';
import { useCanvasStore } from '../../store/canvasStore';

export function SkillsCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['backend', 'frontend'])
  );
  const { addNode } = useCanvasStore();

  // 过滤 skills
  const filteredSkills = useMemo(() => {
    if (!searchQuery) return skillsData;
    const query = searchQuery.toLowerCase();
    return skillsData.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 按类别分组
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, Skill[]> = {};
    filteredSkills.forEach((skill) => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  }, [filteredSkills]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, skill: Skill) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'skill',
      skill,
    }));
  };

  const handleAddSkill = (skill: Skill) => {
    // 在画布中心添加新节点
    const newNode = {
      id: `skill-${Date.now()}`,
      type: 'skill' as const,
      skillId: skill.id,
      name: skill.name,
      description: skill.description,
      enabled: true,
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 400 + 100,
      },
      connections: [],
    };
    addNode(newNode);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg
                     text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Skills List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category} className="mb-2">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                       hover:bg-accent transition-colors text-left"
            >
              <span className="text-lg">{categoryIcons[category as keyof typeof categoryIcons]}</span>
              <span className="flex-1 font-medium text-sm">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </span>
              <span className="text-xs text-muted-foreground">
                {skills.length}
              </span>
              <span className="text-muted-foreground">
                {expandedCategories.has(category) ? '▼' : '▶'}
              </span>
            </button>

            {/* Skills in Category */}
            {expandedCategories.has(category) && (
              <div className="mt-1 space-y-1">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, skill)}
                    onClick={() => handleAddSkill(skill)}
                    className="ml-4 px-3 py-2 rounded-lg bg-background border border-border
                             hover:border-blue-500 hover:bg-blue-500/5 cursor-move
                             transition-all group"
                    title="Drag to canvas or click to add"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium group-hover:text-blue-400 transition-colors">
                          {skill.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {skill.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredSkills.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No skills found
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          💡 Drag skills to canvas or click to add
        </div>
      </div>
    </div>
  );
}
