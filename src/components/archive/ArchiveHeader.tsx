
// Enhanced archive page header component with improved visual design
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
    <div className="mb-12">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-card border border-border rounded-lg">
              <Archive className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                Acervo Reviews
              </h1>
              <div className="h-1 w-24 bg-muted rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Explore nossa coleção completa de reviews médicos curados. 
            Pesquise por especialidade, autor ou tópico específico.
          </p>
        </div>
        
        <div className="relative w-full lg:w-96">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por título, autor ou especialidade..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
