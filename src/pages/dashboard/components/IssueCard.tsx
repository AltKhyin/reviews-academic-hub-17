
// ABOUTME: Issue card component with consistent color system
// Uses app colors for proper visual identity

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Issue } from '@/types/issue';
import { CSS_VARIABLES, APP_COLORS } from '@/utils/colorSystem';

interface IssueCardProps {
  issue: Issue;
  formatTags: (specialtyString: string) => string;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, formatTags }) => {
  return (
    <Card 
      key={issue.id} 
      className="hover:bg-accent/5 transition-colors border"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <CardHeader>
        <div className="w-[110%] -mx-[5%] mb-4">
          {issue.cover_image_url && (
            <img 
              src={issue.cover_image_url} 
              alt={issue.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
        </div>
        <CardTitle className="flex justify-between items-start">
          <span className="text-lg" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>{issue.title}</span>
          <span 
            className={`text-xs px-2 py-1 rounded-full ${
              issue.published 
                ? 'text-green-400' 
                : 'text-yellow-400'
            }`}
            style={{
              backgroundColor: issue.published 
                ? 'rgba(34, 197, 94, 0.1)' 
                : 'rgba(245, 158, 11, 0.1)'
            }}
          >
            {issue.published ? 'Publicado' : 'Rascunho'}
          </span>
        </CardTitle>
        <CardDescription>{issue.description || 'Sem descrição'}</CardDescription>
        {issue.specialty && (
          <div className="mt-2 text-xs">
            <p style={{ color: CSS_VARIABLES.TEXT_MUTED }}>Tags: {formatTags(issue.specialty)}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {issue.pdf_url && issue.pdf_url !== 'placeholder.pdf' && (
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                  color: '#60a5fa' 
                }}
              >
                Revisão PDF
              </span>
            )}
            {issue.article_pdf_url && (
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(147, 51, 234, 0.1)', 
                  color: '#a78bfa' 
                }}
              >
                Artigo Original
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/edit/issue/${issue.id}`}>
              Editar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
