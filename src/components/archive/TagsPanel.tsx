
// ABOUTME: Hierarchical tags panel with proper root/branch selection behavior
import React, { useMemo } from 'react';
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
  // Determine which tags to display based on hierarchical selection
  const displayTags = useMemo(() => {
    const rootCategories = Object.keys(tagConfig);
    
    // If no tags are selected, show only root categories
    if (selectedTags.length === 0) {
      return rootCategories;
    }
    
    // Check if any selected tag is a root category
    const selectedRootCategories = selectedTags.filter(tag => rootCategories.includes(tag));
    
    if (selectedRootCategories.length === 0) {
      // No root categories selected, show all root categories
      return rootCategories;
    }
    
    // Show selected root categories and their branches
    const tagsToShow = new Set<string>();
    
    selectedRootCategories.forEach(rootCategory => {
      // Add the root category itself
      tagsToShow.add(rootCategory);
      
      // Add its subcategories
      const subcategories = tagConfig[rootCategory] || [];
      subcategories.forEach(sub => tagsToShow.add(sub));
    });
    
    // Also add any other selected tags that might be subcategories
    selectedTags.forEach(tag => {
      if (!rootCategories.includes(tag)) {
        tagsToShow.add(tag);
        // Find and add the parent category
        Object.entries(tagConfig).forEach(([category, subcategories]) => {
          if (subcategories.includes(tag)) {
            tagsToShow.add(category);
          }
        });
      }
    });
    
    return Array.from(tagsToShow);
  }, [tagConfig, selectedTags]);

  const isTagSelected = (tag: string) => selectedTags.includes(tag);
  const isRootCategory = (tag: string) => Object.keys(tagConfig).includes(tag);
  const isContextualTag = (tag: string) => contextualTags.includes(tag);

  if (displayTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="flex flex-wrap gap-3 justify-center">
        {displayTags.map((tag) => {
          const selected = isTagSelected(tag);
          const isRoot = isRootCategory(tag);
          const contextual = isContextualTag(tag);
          
          return (
            <Badge
              key={tag}
              variant="outline"
              className={`
                cursor-pointer transition-all duration-200 text-sm py-2 px-4 font-medium
                border-2 hover:shadow-sm
                ${selected 
                  ? 'bg-foreground text-background border-foreground hover:bg-foreground/90' 
                  : isRoot
                    ? 'bg-transparent text-foreground border-foreground/80 hover:bg-foreground/10 font-semibold'
                    : contextual
                      ? 'bg-transparent text-foreground border-foreground/60 hover:bg-foreground/10'
                      : 'bg-transparent text-muted-foreground border-border hover:bg-muted/20 hover:text-foreground hover:border-muted'
                }
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
