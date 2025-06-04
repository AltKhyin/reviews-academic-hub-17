
// ABOUTME: Pinterest-style masonry grid for displaying recent issues
// Implements responsive 2-column layout with hover effects and skeleton loading

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '@/types/issue';
import { Calendar, User, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface IssueMasonryProps {
  issues: Issue[];
  isLoading?: boolean;
  className?: string;
}

const IssueMasonryCard: React.FC<{ issue: Issue; index: number }> = ({ issue, index }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/article/${issue.id}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  // Vary card heights for masonry effect
  const cardHeight = index % 3 === 0 ? 'h-80' : index % 3 === 1 ? 'h-72' : 'h-76';

  return (
    <div 
      className={`magazine-card cursor-pointer ${cardHeight} flex flex-col`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Ler artigo: ${issue.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Cover Image - Top 40% */}
      <div className="h-2/5 relative overflow-hidden rounded-t-xl">
        {issue.cover_image_url ? (
          <img 
            src={issue.cover_image_url}
            alt={`Capa de ${issue.title}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent-blue-400/10 to-accent-blue-600/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-accent-blue-400/30" />
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute top-2 right-2 space-y-1">
          {issue.featured && (
            <span className="bg-yellow-500/90 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
              Destaque
            </span>
          )}
          {!issue.published && (
            <span className="bg-gray-500/90 text-white px-2 py-1 rounded text-xs font-medium">
              Rascunho
            </span>
          )}
        </div>
      </div>

      {/* Content - Bottom 60% */}
      <div className="h-3/5 p-4 flex flex-col justify-between bg-white dark:bg-sheet rounded-b-xl">
        <div className="space-y-3">
          {/* Specialty */}
          {issue.specialty && (
            <span className="inline-block bg-accent-blue-400/20 text-accent-blue-300 px-2 py-1 rounded-full text-xs font-medium">
              {issue.specialty}
            </span>
          )}

          {/* Title */}
          <h3 className="font-serif font-semibold text-lg leading-tight line-clamp-2 text-foreground">
            {issue.title}
          </h3>

          {/* Description */}
          {issue.description && (
            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
              {issue.description}
            </p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-2 border-t border-border/30">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(issue.created_at)}</span>
          </div>
          
          {issue.authors && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-24">{issue.authors}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MasonrySkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className={`magazine-card ${i % 2 === 0 ? 'h-80' : 'h-72'} flex flex-col`}>
        <Skeleton className="h-2/5 rounded-t-xl" />
        <div className="h-3/5 p-4 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const IssueMasonry: React.FC<IssueMasonryProps> = ({ 
  issues, 
  isLoading = false, 
  className = '' 
}) => {
  if (isLoading) {
    return (
      <section className={`${className}`} aria-label="Carregando edições recentes">
        <h2 className="text-2xl font-serif font-semibold mb-6">Edições Recentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MasonrySkeleton />
          <MasonrySkeleton />
        </div>
      </section>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <section className={`${className}`} aria-label="Edições recentes">
        <h2 className="text-2xl font-serif font-semibold mb-6">Edições Recentes</h2>
        <div className="bg-muted/20 rounded-xl p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma edição recente disponível no momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`${className}`} aria-label="Edições recentes">
      <h2 className="text-2xl font-serif font-semibold mb-6">Edições Recentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {issues.map((issue, index) => (
          <IssueMasonryCard key={issue.id} issue={issue} index={index} />
        ))}
      </div>
    </section>
  );
};

export default IssueMasonry;
