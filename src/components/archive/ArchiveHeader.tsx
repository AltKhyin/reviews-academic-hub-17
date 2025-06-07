
// Streamlined archive header without competing search element
import React from 'react';
import { Archive } from 'lucide-react';

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
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Centered title section */}
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
            Use as especialidades abaixo ou busque por conteúdo específico.
          </p>
        </div>
      </div>
    </div>
  );
};
