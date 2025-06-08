
// ABOUTME: Enhanced tags panel with contextual tag highlighting and improved UX
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
  
  // Enhanced display logic: show selected + contextual + initial tags
  const displayTags = React.useMemo(() => {
    const allTags = new Set<string>();
    
    // Always include selected tags first
    selectedTags.forEach(tag => allTags.add(tag));
    
    // Add contextual tags (related/suggested tags)
    contextualTags.forEach(tag => allTags.add(tag));
    
    // Fill remaining space with initial tags
    initialTags.forEach(tag => allTags.add(tag));
    
    return Array.from(allTags);
  }, [selectedTags, contextualTags, initialTags]);

  const isTagSelected = (tag: string) => selectedTags.includes(tag);
  const isContextualTag = (tag: string) => contextualTags.includes(tag) && !selectedTags.includes(tag);

  if (displayTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      {/* Enhanced tags display with contextual highlighting */}
      <div className="flex flex-wrap gap-3 mb-6">
        {displayTags.map((tag) => {
          const selected = isTagSelected(tag);
          const contextual = isContextualTag(tag);
          
          return (
            <Badge
              key={tag}
              variant="outline"
              className={`
                cursor-pointer transition-all duration-200 text-sm py-2 px-4 font-medium
                border-2 hover:shadow-sm relative
                ${selected 
                  ? 'bg-foreground text-background border-foreground hover:bg-foreground/90 shadow-md' 
                  : contextual
                    ? 'bg-foreground/5 text-foreground border-foreground/40 hover:bg-foreground/10 hover:border-foreground/60 shadow-sm'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted/20 hover:text-foreground hover:border-muted'
                }
              `}
              onClick={() => onTagSelect(tag)}
            >
              {tag}
              {contextual && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60" />
              )}
            </Badge>
          );
        })}
      </div>
      
      {/* Enhanced status indicator */}
      {(selectedTags.length > 0 || contextualTags.length > 0) && (
        <div className="border-l-2 border-foreground pl-4 py-2">
          <div className="text-sm text-foreground font-medium">
            {selectedTags.length === 0 ? (
              <span className="text-muted-foreground">
                Navegue pelos temas acima para personalizar a ordem dos artigos
              </span>
            ) : selectedTags.length === 1 ? (
              <span>
                Priorizando conteúdo sobre "{selectedTags[0]}"
              </span>
            ) : (
              <span>
                Priorizando {selectedTags.length} temas selecionados
              </span>
            )}
            
            {contextualTags.length > 0 && (
              <span className="ml-3 text-muted-foreground font-normal">
                • {contextualTags.length} temas relacionados em destaque
              </span>
            )}
          </div>
          
          {selectedTags.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Os artigos estão ordenados por relevância aos temas selecionados
            </div>
          )}
        </div>
      )}
    </div>
  );
};
