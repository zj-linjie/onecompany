/**
 * 侧边栏容器组件
 */

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  side: 'left' | 'right';
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function Sidebar({ side, title, isOpen, onToggle, children }: SidebarProps) {
  return (
    <div
      className={`
        relative h-full bg-secondary border-border transition-all duration-300
        ${side === 'left' ? 'border-r' : 'border-l'}
        ${isOpen ? 'w-80' : 'w-12'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          absolute top-4 bg-secondary border border-border rounded-lg p-2
          hover:bg-accent transition-colors z-10
          ${side === 'left' ? '-right-4' : '-left-4'}
        `}
        title={isOpen ? 'Collapse' : 'Expand'}
      >
        {side === 'left' ? (
          isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        ) : (
          isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Sidebar Content */}
      {isOpen && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      )}

      {/* Collapsed State - Vertical Text */}
      {!isOpen && (
        <div className="h-full flex items-center justify-center">
          <div
            className="text-sm font-medium text-muted-foreground"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
            }}
          >
            {title}
          </div>
        </div>
      )}
    </div>
  );
}
