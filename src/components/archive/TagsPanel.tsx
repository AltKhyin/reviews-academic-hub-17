
// Interactive tags panel for the archive page
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

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => {
          const selected = isTagSelected(tag);
          const contextual = isContextualTag(tag);
          
          return (
            <Badge
              key={tag}
              variant={selected ? "default" : "outline"}
              className={`
                cursor-pointer transition-all duration-200 text-sm py-2 px-4
                ${selected 
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                  : contextual
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-transparent text-gray-400 border-gray-600 hover:bg-gray-800 hover:text-white'
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
        <div className="mt-4 text-sm text-gray-400">
          {selectedTags.length === 1 
            ? `Ordenando por relevância para "${selectedTags[0]}"`
            : `Ordenando por relevância para ${selectedTags.length} tags selecionadas`
          }
          {contextualTags.length > 0 && (
            <span className="ml-2">
              • {contextualTags.length} tags relacionadas sugeridas
            </span>
          )}
        </div>
      )}
    </div>
  );
};
