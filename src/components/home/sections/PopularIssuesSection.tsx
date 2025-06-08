
// ABOUTME: Popular issues horizontal section - Monochromatic design compliant
import React from 'react';
import { useHomeData } from '@/hooks/useHomeData';
import { useNavigate } from 'react-router-dom';
import { IssueCard } from '../common/IssueCard';
import { HorizontalScrollableCards } from '../common/HorizontalScrollableCards';

export const PopularIssuesSection: React.FC = () => {
  const { popularIssues, homeSettings, isLoading, trackIssueView } = useHomeData();
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
        <h2 className="text-2xl font-semibold text-foreground">Mais Populares</h2>
        <div className="flex gap-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-[260px] h-[380px] bg-muted animate-pulse rounded-lg flex-shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!popularIssues || popularIssues.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Mais Populares</h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>Dados de popularidade ainda sendo coletados...</p>
        </div>
      </div>
    );
  }

  const periodText = homeSettings?.popular_issues?.period === 'week' ? 'da Semana' : 'do Mês';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Mais Populares {periodText}</h2>
      
      <HorizontalScrollableCards>
        {popularIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={() => handleIssueClick(issue.id)}
            showViewCount={true}
          />
        ))}
      </HorizontalScrollableCards>
    </div>
  );
};
