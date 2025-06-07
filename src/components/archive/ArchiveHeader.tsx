
// Archive page header component
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ArchiveHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Reviews.</h1>
        <p className="text-gray-400 text-lg">
          Explore as edições anteriores da nossa curadoria
        </p>
      </div>
      
      <div className="relative w-full lg:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar por título ou autor..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gray-500"
        />
      </div>
    </div>
  );
};
