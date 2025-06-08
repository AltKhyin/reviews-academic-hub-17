
// ABOUTME: Recent issues horizontal section - Monochromatic design compliant
import React from 'react';
import { useHomeData } from '@/hooks/useHomeData';
import { useNavigate } from 'react-router-dom';
import { IssueCard } from '../common/IssueCard';
import { HorizontalScrollableCards } from '../common/HorizontalScrollableCards';

export const RecentIssuesSection: React.FC = () => {
  const { recentIssues, isLoading, trackIssueView } = useHomeData();
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
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Edições Recentes</h2>
        <div className="flex gap-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-[260px] h-[380px] bg-muted animate-pulse rounded-lg flex-shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recentIssues || recentIssues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Edições Recentes</h2>
      
      <HorizontalScrollableCards>
        {recentIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={() => handleIssueClick(issue.id)}
            showNewBadge={true}
          />
        ))}
      </HorizontalScrollableCards>
    </div>
  );
};
