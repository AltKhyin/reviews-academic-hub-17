
// Enhanced interactive tags panel with improved visual design
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
  // Get initial tags to display (mix of categories and popular subcategories)
  const getInitialTags = (): string[] => {
    const categories = Object.keys(tagConfig);
    const popularSubcategories = Object.values(tagConfig)
      .flat()
      .filter(tag => tag.length > 0)
      .slice(0, Math.max(0, maxInitialTags - categories.length));
    
    return [...categories, ...popularSubcategories].slice(0, maxInitialTags);
  };

  const initialTags = getInitialTags();
  const displayTags = selectedTags.length > 0 
    ? [...new Set([...selectedTags, ...contextualTags, ...initialTags])]
    : initialTags;

  const isTagSelected = (tag: string) => selectedTags.includes(tag);
  const isContextualTag = (tag: string) => contextualTags.includes(tag);

  if (displayTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-wrap gap-3">
          {displayTags.map((tag) => {
            const selected = isTagSelected(tag);
            const contextual = isContextualTag(tag);
            
            return (
              <Badge
                key={tag}
                variant={selected ? "default" : "outline"}
                className={`
                  cursor-pointer transition-all duration-200 text-sm py-2 px-4 font-medium
                  ${selected 
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                    : contextual
                      ? 'bg-muted/50 text-muted-foreground border-muted hover:bg-muted/70 hover:text-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:bg-muted/30 hover:text-foreground hover:border-muted'
                  }
                `}
                onClick={() => onTagSelect(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
        
        {selectedTags.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {selectedTags.length === 1 
                ? `Filtrando por "${selectedTags[0]}"`
                : `Filtrando por ${selectedTags.length} especialidades selecionadas`
              }
              {contextualTags.length > 0 && (
                <span className="ml-3 text-muted-foreground/70">
                  • {contextualTags.length} tags relacionadas sugeridas
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
