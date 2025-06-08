
// ABOUTME: Popular issues section for the home page - Monochromatic design compliant
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { useNavigate } from 'react-router-dom';
import { IssueCard } from '../common/IssueCard';

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
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Edições Populares</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!popularIssues || popularIssues.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Edições Populares</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Dados de popularidade ainda sendo coletados...</p>
        </div>
      </div>
    );
  }

  const displayIssues = popularIssues.slice(0, 6);
  const periodText = homeSettings?.popular_issues?.period === 'week' ? 'Esta Semana' : 'Este Mês';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Edições Populares</h2>
          <Badge variant="secondary">{periodText}</Badge>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/acervo')}
          className="flex items-center gap-2 border-border hover:bg-accent"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={() => handleIssueClick(issue.id)}
            showViewCount={true}
          />
        ))}
      </div>
    </div>
  );
};
