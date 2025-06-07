
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Issue } from '@/types/issue';

interface IssueCardProps {
  issue: Issue;
  formatTags: (specialtyString: string) => string;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, formatTags }) => {
  return (
    <Card key={issue.id} className="hover:bg-accent/5 transition-colors border-white/10 bg-white/5">
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
          <span className="text-lg">{issue.title}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            issue.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
          }`}>
            {issue.published ? 'Publicado' : 'Rascunho'}
          </span>
        </CardTitle>
        <CardDescription>{issue.description || 'Sem descrição'}</CardDescription>
        {issue.specialty && (
          <div className="mt-2 text-xs">
            <p className="text-muted-foreground">Tags: {formatTags(issue.specialty)}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {issue.pdf_url && issue.pdf_url !== 'placeholder.pdf' && (
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">
                Revisão PDF
              </span>
            )}
            {issue.article_pdf_url && (
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full">
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
