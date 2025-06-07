
// Refined archive header with enhanced visual hierarchy and spacing
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, Archive } from 'lucide-react';

interface ArchiveHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="mb-16">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
        {/* Enhanced title section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-card border border-border rounded-xl shadow-sm">
              <Archive className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-none">
                Acervo Reviews
              </h1>
              <div className="h-1.5 w-32 bg-gradient-to-r from-green-500 to-green-400 rounded-full mt-3"></div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Explore nossa coleção completa de reviews médicos curados. 
            <br />
            Pesquise por especialidade, autor ou tópico específico para encontrar conteúdo relevante.
          </p>
        </div>
        
        {/* Enhanced search section */}
        <div className="w-full lg:w-96">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-foreground transition-colors" />
            <Input
              type="text"
              placeholder="Buscar por título, autor ou especialidade..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-14 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-base shadow-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 ml-1">
            Dica: Use aspas para busca exata ou + para múltiplos termos
          </p>
        </div>
      </div>
    </div>
  );
};
