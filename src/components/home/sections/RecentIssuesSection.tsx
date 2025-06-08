
// ABOUTME: Recent issues section for the home page
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { useNavigate } from 'react-router-dom';
import { IssueCard } from '../common/IssueCard';

export const RecentIssuesSection: React.FC = () => {
  const { recentIssues, homeSettings, isLoading, trackIssueView } = useHomeData();
  const navigate = useNavigate();

  const handleIssueClick = async (issueId: string) => {
    try {
      await trackIssueView({ issueId });
    } catch (error) {
      console.log('Failed to track view:', error);
    }
    navigate(`/article/${issueId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Edições Recentes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recentIssues || recentIssues.length === 0) {
    return null;
  }

  const displayIssues = recentIssues.slice(0, 6);
  const hasMore = recentIssues.length > 6;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Edições Recentes</h2>
          <Badge variant="secondary">{recentIssues.length}</Badge>
        </div>
        
        {hasMore && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/acervo')}
            className="flex items-center gap-2"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={() => handleIssueClick(issue.id)}
            showNewBadge={true}
          />
        ))}
      </div>
    </div>
  );
};
