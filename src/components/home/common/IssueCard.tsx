
// ABOUTME: Reusable issue card component matching /acervo styling - Monochromatic design compliant
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye } from 'lucide-react';
import { Issue } from '@/types/issue';
import { PopularIssue, HomeIssue } from '@/types/home';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IssueCardProps {
  issue: Issue | PopularIssue | HomeIssue;
  onClick: () => void;
  showNewBadge?: boolean;
  showViewCount?: boolean;
  className?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({ 
  issue, 
  onClick, 
  showNewBadge = false, 
  showViewCount = false,
  className = ""
}) => {
  const isNew = showNewBadge && issue.published_at && 
    Date.now() - new Date(issue.published_at).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <Card 
      className={`group cursor-pointer hover:shadow-lg transition-all duration-300 w-[260px] flex-shrink-0 border-border bg-card overflow-hidden ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {issue.cover_image_url && (
          <div className="relative overflow-hidden">
            <img
              src={issue.cover_image_url}
              alt={issue.title}
              className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {isNew && (
              <Badge className="absolute top-3 right-3 bg-success text-background text-xs">
                Novo
              </Badge>
            )}
            
            {showViewCount && 'view_count' in issue && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded text-xs">
                <Eye className="w-3 h-3" />
                {issue.view_count}
              </div>
            )}

            {/* Always show view icon for all cards */}
            {!showViewCount && (
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded text-xs">
                  <Eye className="w-3 h-3" />
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              {issue.specialty}
            </Badge>
          </div>
          
          <h3 className="font-semibold text-lg leading-tight mb-3 group-hover:text-foreground transition-colors line-clamp-2 text-card-foreground">
            {issue.title}
          </h3>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            {issue.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(issue.published_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            )}
            
            {'authors' in issue && issue.authors && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="truncate">{issue.authors}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
