
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, HelpCircle, X } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchTag {
  term: string;
  exclude: boolean;
}

interface SearchHeaderProps {
  queryText: string;
  setQueryText: (value: string) => void;
  handleSubmitSearch: (e: React.FormEvent) => void;
  searchTags: SearchTag[];
  handleTagRemove: (index: number) => void;
  handleTagToggleExclude: (index: number) => void;
  clearFilters: () => void;
  queryPreview: string;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  queryText,
  setQueryText,
  handleSubmitSearch,
  searchTags,
  handleTagRemove,
  handleTagToggleExclude,
  clearFilters,
  queryPreview
}) => {
  return (
    <>
      <form onSubmit={handleSubmitSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Pesquisa..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Sintaxe: Use termos simples ou aspas para frases exatas.
                    <br /><br />
                    <strong>AND</strong>: Ambos os termos (padrão)
                    <br />
                    <strong>OR</strong>: Qualquer dos termos
                    <br />
                    <strong>NOT</strong>: Excluir termo
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <Button type="submit">
          <Search size={18} className="mr-2" />
          Buscar
        </Button>
      </form>

      {/* Search Tags */}
      {searchTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {searchTags.map((tag, index) => (
            <Badge 
              key={index} 
              variant={tag.exclude ? "outline" : "default"}
              className={`${tag.exclude ? 'border-destructive text-destructive' : ''} flex items-center gap-1 cursor-pointer`}
            >
              <span onClick={() => handleTagToggleExclude(index)}>
                {tag.exclude ? 'NOT ' : ''}{tag.term}
              </span>
              <button 
                onClick={() => handleTagRemove(index)} 
                className="ml-1 hover:bg-gray-700/50 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          {searchTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
              Limpar
            </Button>
          )}
        </div>
      )}

      {/* Query Preview */}
      {queryPreview && (
        <div className="text-sm text-gray-500 mt-2">
          Query: {queryPreview}
        </div>
      )}
    </>
  );
};
