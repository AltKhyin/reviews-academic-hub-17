
// Results grid component for displaying filtered issues
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface ResultsGridProps {
  issues: Array<ArchiveIssue & { tagMatches?: number }>;
  isLoading: boolean;
  searchQuery: string;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  issues,
  isLoading,
  searchQuery
}) => {
  const navigate = useNavigate();

  const handleIssueClick = (issueId: string) => {
    navigate(`/article/${issueId}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div 
            key={index}
            className="bg-gray-800 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-700 rounded mb-3"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">
          Nenhuma edição encontrada
        </div>
        {searchQuery && (
          <p className="text-gray-500 text-sm">
            Sua busca por "{searchQuery}" não retornou resultados
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-400 text-sm">
          {issues.length} edição{issues.length !== 1 ? 'ões' : ''} encontrada{issues.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={handleIssueClick}
            tagMatches={issue.tagMatches}
          />
        ))}
      </div>
    </div>
  );
};
