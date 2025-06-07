
// Enhanced interactive tags panel with refined green styling for recommendations
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
    <div className="mb-8">
      {/* Tags without background container */}
      <div className="flex flex-wrap gap-2 mb-6">
        {displayTags.map((tag) => {
          const selected = isTagSelected(tag);
          const contextual = isContextualTag(tag);
          
          return (
            <Badge
              key={tag}
              variant="outline"
              className={`
                cursor-pointer transition-all duration-200 text-sm py-1.5 px-3 font-medium
                border-2 hover:shadow-sm rounded-full
                ${selected 
                  ? 'bg-green-500/90 text-white border-green-500 hover:bg-green-600 shadow-md' 
                  : contextual
                    ? 'bg-transparent text-green-600 border-green-500 hover:bg-green-50/5 hover:text-green-500'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted/10 hover:text-foreground hover:border-muted'
                }
              `}
              onClick={() => onTagSelect(tag)}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
      
      {/* Status indicator with subtle styling */}
      {selectedTags.length > 0 && (
        <div className="border-l-2 border-green-500 pl-4 py-2">
          <div className="text-sm text-foreground font-medium">
            {selectedTags.length === 1 
              ? `Filtrando por "${selectedTags[0]}"`
              : `${selectedTags.length} especialidades selecionadas`
            }
            {contextualTags.length > 0 && (
              <span className="ml-3 text-muted-foreground font-normal">
                • {contextualTags.length} sugestões relacionadas
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
