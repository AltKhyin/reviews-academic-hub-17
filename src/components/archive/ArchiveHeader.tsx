
// Streamlined archive header with improved layout hierarchy
import React from 'react';
import { Archive } from 'lucide-react';

export const ArchiveHeader: React.FC = () => {
  return (
    <div className="mb-12">
      <div className="text-center space-y-6">
        {/* Enhanced title section with centered layout */}
        <div className="flex items-center justify-center space-x-4">
          <div className="p-3 bg-card border border-border rounded-xl shadow-sm">
            <Archive className="w-7 h-7 text-foreground" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-none">
              Acervo Reviews
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-green-400 rounded-full mt-2 mx-auto"></div>
          </div>
        </div>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mx-auto">
          Explore nossa coleção completa de reviews médicos curados. 
          Use as especialidades abaixo para filtrar o conteúdo ou busque por termos específicos.
        </p>
      </div>
    </div>
  );
};
