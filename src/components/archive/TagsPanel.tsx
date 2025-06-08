
// ABOUTME: Backend tag selection panel with parent/subtag hierarchy and three visual states
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
        <div className="flex flex-wrap gap-3">
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
        return `${baseClasses} bg-transparent text-white/60 border-transparent hover:bg-white/5 hover:text-white/80`;
    }
  };

  return (
    <div className="mb-8">
      <div className="space-y-4">
        {/* Clear all button - only show when tags are selected */}
        {hasActiveTagSelection && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedTags.length} {selectedTags.length === 1 ? 'categoria selecionada' : 'categorias selecionadas'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllTags}
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar seleção
            </Button>
          </div>
        )}

        {/* Tags container */}
        <div className="flex flex-wrap gap-3">
          {/* Parent categories - always visible */}
          {parentCategories.map(category => {
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

          {/* Subtags - only visible when parent is selected */}
          {visibleSubtags.length > 0 && (
            <>
              {/* Visual separator */}
              <div className="w-full flex items-center my-2">
                <div className="flex-1 h-px bg-border"></div>
                <span className="px-3 text-xs text-muted-foreground bg-background">
                  Subtemas
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Subtag badges with indentation */}
              {visibleSubtags.map(subtag => {
                const state = getTagState(subtag);
                return (
                  <Badge
                    key={subtag}
                    variant="outline"
                    className={`ml-6 ${getTagStyleClasses(state)}`}
                    onClick={() => onTagSelect(subtag)}
                  >
                    {subtag}
                  </Badge>
                );
              })}
            </>
          )}
        </div>

        {/* Help text */}
        {!hasActiveTagSelection && parentCategories.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Selecione categorias para reordenar as edições por relevância
          </p>
        )}
      </div>
    </div>
  );
};
