
// ABOUTME: Simplified backend tag selection panel with visual state-based ordering and minimal UI
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TagsPanelProps {
  parentCategories: string[];
  visibleSubtags: string[];
  selectedTags: string[];
  hasActiveTagSelection: boolean;
  isLoading: boolean;
  onTagSelect: (tag: string) => void;
  onClearAllTags: () => void;
  getTagState: (tag: string) => 'selected' | 'highlighted' | 'unselected';
}

export const TagsPanel: React.FC<TagsPanelProps> = ({
  parentCategories,
  visibleSubtags,
  selectedTags,
  hasActiveTagSelection,
  isLoading,
  onTagSelect,
  onClearAllTags,
  getTagState
}) => {
  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {/* Loading skeleton */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-8 w-24 bg-muted/20 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (parentCategories.length === 0) {
    return null;
  }

  const getTagStyleClasses = (state: 'selected' | 'highlighted' | 'unselected'): string => {
    const baseClasses = 'cursor-pointer transition-all duration-200 text-sm py-2 px-4 font-medium border-2 hover:shadow-sm';
    
    switch (state) {
      case 'selected':
        return `${baseClasses} bg-white text-black border-white hover:bg-gray-100`;
      case 'highlighted':
        return `${baseClasses} bg-transparent text-white border-white/60 hover:bg-white/10 hover:border-white/80`;
      case 'unselected':
        return `${baseClasses} bg-transparent text-white border-white/30 hover:bg-white/5 hover:border-white/50`;
    }
  };

  // Sort tags by selection state: selected first, then highlighted, then unselected
  const sortTagsByState = (tags: string[]) => {
    return [...tags].sort((a, b) => {
      const stateA = getTagState(a);
      const stateB = getTagState(b);
      
      // Define priority order: selected (0), highlighted (1), unselected (2)
      const getPriority = (state: string) => {
        switch (state) {
          case 'selected': return 0;
          case 'highlighted': return 1;
          case 'unselected': return 2;
          default: return 3;
        }
      };
      
      const priorityA = getPriority(stateA);
      const priorityB = getPriority(stateB);
      
      // If same priority, maintain alphabetical order for consistency
      if (priorityA === priorityB) {
        return a.localeCompare(b);
      }
      
      return priorityA - priorityB;
    });
  };

  // Sort parent categories and subtags by their selection state
  const sortedParentCategories = sortTagsByState(parentCategories);
  const sortedVisibleSubtags = sortTagsByState(visibleSubtags);

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {/* Parent categories - sorted by selection state */}
        {sortedParentCategories.map(category => {
          const state = getTagState(category);
          return (
            <Badge
              key={category}
              variant="outline"
              className={getTagStyleClasses(state)}
              onClick={() => onTagSelect(category)}
            >
              {category}
            </Badge>
          );
        })}

        {/* Subtags - only visible when parent is selected, sorted by state */}
        {sortedVisibleSubtags.map(subtag => {
          const state = getTagState(subtag);
          return (
            <Badge
              key={subtag}
              variant="outline"
              className={`ml-4 ${getTagStyleClasses(state)}`}
              onClick={() => onTagSelect(subtag)}
            >
              {subtag}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
