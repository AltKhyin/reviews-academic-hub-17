
// ABOUTME: Enhanced tags panel with proper root/branch hierarchy display and state management
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TagHierarchy } from '@/types/archive';

interface TagsPanelProps {
  tagConfig: TagHierarchy;
  selectedTags: string[];
  contextualTags: string[];
  onTagSelect: (tag: string) => void;
  maxInitialTags?: number;
}

export const TagsPanel: React.FC<TagsPanelProps> = ({
  tagConfig,
  selectedTags,
  contextualTags,
  onTagSelect,
  maxInitialTags = 20
}) => {
  // Get root categories (main tag categories)
  const rootCategories = Object.keys(tagConfig);
  
  // Determine which root categories are selected
  const selectedRootCategories = selectedTags.filter(tag => rootCategories.includes(tag));
  
  // Get subcategories for selected root categories
  const getSubcategoriesForSelected = (): string[] => {
    const subcategories: string[] = [];
    selectedRootCategories.forEach(rootTag => {
      const subs = tagConfig[rootTag] || [];
      subcategories.push(...subs);
    });
    return subcategories;
  };

  // Determine display tags based on selection state
  const getDisplayTags = (): { tag: string; type: 'root' | 'subcategory' }[] => {
    const displayTags: { tag: string; type: 'root' | 'subcategory' }[] = [];
    
    if (selectedRootCategories.length === 0) {
      // No root categories selected - show only root categories
      rootCategories.forEach(root => {
        displayTags.push({ tag: root, type: 'root' });
      });
    } else {
      // Some root categories selected - show selected roots + their subcategories
      selectedRootCategories.forEach(root => {
        displayTags.push({ tag: root, type: 'root' });
        const subcategories = tagConfig[root] || [];
        subcategories.forEach(sub => {
          displayTags.push({ tag: sub, type: 'subcategory' });
        });
      });
      
      // Also show unselected root categories
      rootCategories.forEach(root => {
        if (!selectedRootCategories.includes(root)) {
          displayTags.push({ tag: root, type: 'root' });
        }
      });
    }
    
    return displayTags;
  };

  const displayTags = getDisplayTags();
  const subcategoriesForSelected = getSubcategoriesForSelected();

  const getTagState = (tag: string, type: 'root' | 'subcategory') => {
    if (selectedTags.includes(tag)) {
      return 'selected';
    }
    
    if (type === 'subcategory' && selectedRootCategories.length > 0) {
      // Subcategory is highlighted if its parent root is selected
      return 'highlighted';
    }
    
    return 'unselected';
  };

  if (displayTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        {displayTags.map(({ tag, type }) => {
          const state = getTagState(tag, type);
          
          return (
            <Badge
              key={tag}
              variant="outline"
              className={`
                cursor-pointer transition-all duration-200 text-sm py-2 px-4 font-medium
                border-2 hover:shadow-sm
                ${state === 'selected'
                  ? 'bg-foreground text-background border-foreground hover:bg-foreground/90' 
                  : state === 'highlighted'
                    ? 'bg-transparent text-foreground border-foreground/60 hover:bg-foreground/10'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted/20 hover:text-foreground hover:border-muted'
                }
                ${type === 'subcategory' ? 'ml-4' : ''}
              `}
              onClick={() => onTagSelect(tag)}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
