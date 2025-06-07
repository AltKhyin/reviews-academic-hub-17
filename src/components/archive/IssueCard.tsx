
// Individual issue card component for the archive grid
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';
import { ArchiveIssue } from '@/types/archive';

interface IssueCardProps {
  issue: ArchiveIssue;
  onClick: (issueId: string) => void;
  tagMatches?: number;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  tagMatches = 0
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getEditionNumber = () => {
    // Extract edition number from title or use a default format
    const match = issue.title.match(/#(\d+)/);
    return match ? `#${match[1]}` : `#${issue.id.slice(-3)}`;
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 bg-gray-900 border-gray-700 hover:border-gray-600"
      onClick={() => onClick(issue.id)}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant="outline" 
            className="text-xs bg-blue-900/30 text-blue-300 border-blue-600"
          >
            Edição {getEditionNumber()}
          </Badge>
          {tagMatches > 0 && (
            <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-300">
              {tagMatches} match{tagMatches > 1 ? 'es' : ''}
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors">
          {issue.search_title || issue.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          {issue.authors && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="line-clamp-1">{issue.authors}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(issue.published_at || issue.created_at)}</span>
          </div>
        </div>
        
        {(issue.search_description || issue.description) && (
          <p className="text-sm text-gray-300 line-clamp-3 mb-4">
            {issue.search_description || issue.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="w-3 h-3" />
            <span>PDF disponível</span>
          </div>
          
          {issue.specialty && (
            <div className="flex flex-wrap gap-1">
              {issue.specialty.split(',').slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs bg-transparent text-gray-400 border-gray-600"
                >
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {issue.year && (
          <div className="mt-2 text-xs text-gray-500">
            Estudo de {issue.year}
            {issue.design && ` • ${issue.design}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
