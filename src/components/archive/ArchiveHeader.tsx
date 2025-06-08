
// ABOUTME: Enhanced archive header with search and integrated tag panel positioning
import React from 'react';
import { Archive, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TagsPanel } from './TagsPanel';

interface ArchiveHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Tag-related props
  parentCategories?: string[];
  visibleSubtags?: string[];
  selectedTags?: string[];
  hasActiveTagSelection?: boolean;
  isTagsLoading?: boolean;
  onTagSelect?: (tag: string) => void;
  onClearAllTags?: () => void;
  getTagState?: (tag: string) => 'selected' | 'highlighted' | 'unselected';
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  searchQuery,
  onSearchChange,
  parentCategories = [],
  visibleSubtags = [],
  selectedTags = [],
  hasActiveTagSelection = false,
  isTagsLoading = false,
  onTagSelect = () => {},
  onClearAllTags = () => {},
  getTagState = () => 'unselected'
}) => {
  return (
    <div className="mb-12">
      <div className="flex flex-col items-center text-center space-y-8">
        {/* Title section */}
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="p-4 bg-card border border-border rounded-xl shadow-sm">
              <Archive className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-none">
                Acervo Reviews
              </h1>
              <div className="h-1.5 w-32 bg-gradient-to-r from-green-500 to-green-400 rounded-full mt-3 mx-auto"></div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mx-auto">
            Explore nossa coleção completa de reviews médicos curados.
            <br />
            Use as categorias abaixo ou busque por conteúdo específico.
          </p>
        </div>

        {/* Search bar section */}
        <div className="w-full max-w-2xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Buscar conteúdo..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base bg-card border-border rounded-lg
                         focus:ring-2 focus:ring-ring focus:border-transparent
                         placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Tags panel - positioned under search bar as requested */}
        <div className="w-full max-w-6xl">
          <TagsPanel
            parentCategories={parentCategories}
            visibleSubtags={visibleSubtags}
            selectedTags={selectedTags}
            hasActiveTagSelection={hasActiveTagSelection}
            isLoading={isTagsLoading}
            onTagSelect={onTagSelect}
            onClearAllTags={onClearAllTags}
            getTagState={getTagState}
          />
        </div>
      </div>
    </div>
  );
};
