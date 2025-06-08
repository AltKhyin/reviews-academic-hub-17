// ABOUTME: Enhanced tags panel with proper root/branch hierarchy display and three distinct visual states
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
  // Get root categories (parent tags only)
  const rootCategories = Object.keys(tagConfig);
  
  // Determine which root categories are currently selected
  const selectedRootCategories = selectedTags.filter(tag => rootCategories.includes(tag));
  
  // Get all subcategories for selected root categories
  const getSubcategoriesForSelected = (): string[] => {
    const subcategories: string[] = [];
    selectedRootCategories.forEach(rootTag => {
      const subs = tagConfig[rootTag] || [];
      subcategories.push(...subs);
    });
    return subcategories;
  };

  // Determine which tags should be displayed based on selection state
  const getDisplayTags = (): { tag: string; type: 'root' | 'subcategory' }[] => {
    const displayTags: { tag: string; type: 'root' | 'subcategory' }[] = [];
    
    if (selectedRootCategories.length === 0) {
      // No root categories selected - show ONLY root categories (parent tags)
      rootCategories.forEach(root => {
        displayTags.push({ tag: root, type: 'root' });
      });
    } else {
      // Root categories selected - show selected roots first, then their subcategories, then unselected roots
      
      // First: Show selected root categories
      selectedRootCategories.forEach(root => {
        displayTags.push({ tag: root, type: 'root' });
      });
      
      // Second: Show subcategories of selected roots (these will be highlighted)
      selectedRootCategories.forEach(root => {
        const subcategories = tagConfig[root] || [];
        subcategories.forEach(sub => {
          displayTags.push({ tag: sub, type: 'subcategory' });
        });
      });
      
      // Third: Show unselected root categories
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

  // Determine the visual state of each tag
  const getTagState = (tag: string, type: 'root' | 'subcategory'): 'selected' | 'highlighted' | 'unselected' => {
    // If the tag is directly selected
    if (selectedTags.includes(tag)) {
      return 'selected';
    }
    
    // If it's a subcategory and its parent root is selected (but the subcategory itself isn't selected)
    if (type === 'subcategory' && selectedRootCategories.length > 0) {
      const isChildOfSelectedRoot = selectedRootCategories.some(rootTag => {
        const subcategories = tagConfig[rootTag] || [];
        return subcategories.includes(tag);
      });
      
      if (isChildOfSelectedRoot) {
        return 'highlighted';
      }
    }
    
    // Otherwise it's unselected
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
                    ? 'bg-foreground/20 text-foreground border-foreground/80 hover:bg-foreground/30'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted/20 hover:text-foreground hover:border-muted-foreground'
                }
                ${type === 'subcategory' ? 'ml-6' : ''}
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
