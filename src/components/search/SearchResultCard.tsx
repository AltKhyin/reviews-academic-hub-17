
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Issue } from '@/types/issue';

interface SearchResultCardProps {
  article: Issue;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ article }) => {
  // Display author data if available, otherwise use fallback
  const authors = article.authors || "Smith J, Johnson A, et al.";
  const year = article.year || new Date(article.created_at).getFullYear();
  const studyType = article.design || ["RCT", "Metanálise", "Coorte", "Caso-Controle", "Revisão Sistemática"][Math.floor(Math.random() * 5)];
  const karma = article.score || Math.floor(Math.random() * 100);
  const title = article.search_title || article.title;
  const description = article.search_description || article.description;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all group">
      <div className="p-4 flex justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
              {studyType}
            </Badge>
            <span className="text-xs text-gray-400">{year}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{authors}</span>
          </div>
          
          <Link to={`/article/${article.id}`} className="hover:underline">
            <h3 className="font-medium text-lg mb-2">{title}</h3>
          </Link>
          
          <p className="text-sm text-gray-400 line-clamp-2">{description || "Sem descrição disponível."}</p>
        </div>
        
        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-1 text-gray-400">
            <span className="text-sm font-medium">{karma}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 14-7-7-7 7" />
            </svg>
          </div>
          
          <Link to={`/article/${article.id}`}>
            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye size={16} className="mr-1" />
              Ver artigo
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
