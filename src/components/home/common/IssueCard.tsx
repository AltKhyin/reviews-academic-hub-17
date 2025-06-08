
// ABOUTME: Reusable issue card component for home page sections - Monochromatic design compliant
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye, TrendingUp } from 'lucide-react';
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
      className={`group cursor-pointer hover:shadow-lg transition-all duration-300 h-full border-border bg-card ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-0 h-full">
        {issue.cover_image_url && (
          <div className="relative overflow-hidden">
            <img
              src={issue.cover_image_url}
              alt={issue.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />
            
            {isNew && (
              <Badge className="absolute top-3 left-3 bg-success text-background">
                Novo
              </Badge>
            )}
            
            {showViewCount && 'view_count' in issue && (
              <Badge variant="secondary" className="absolute top-3 right-3 bg-secondary/70 text-secondary-foreground">
                <Eye className="w-3 h-3 mr-1" />
                {issue.view_count}
              </Badge>
            )}
          </div>
        )}
        
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              {issue.specialty}
            </Badge>
            {showViewCount && 'view_count' in issue && (
              <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                <TrendingUp className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold text-lg leading-tight mb-3 group-hover:text-foreground transition-colors line-clamp-2 text-card-foreground">
            {issue.title}
          </h3>
          
          <div className="mt-auto space-y-2 text-sm text-muted-foreground">
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
