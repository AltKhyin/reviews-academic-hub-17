
// ABOUTME: Magazine-style hero component featuring the main issue with elegant typography
// Implements the cover stack layout with responsive design and accessibility features

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '@/types/issue';
import { Button } from '@/components/ui/button';
import { Calendar, User } from 'lucide-react';

interface CoverStackHeroProps {
  issue: Issue;
  className?: string;
}

export const CoverStackHero: React.FC<CoverStackHeroProps> = ({ 
  issue, 
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleReadClick = () => {
    navigate(`/article/${issue.id}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <section 
      className={`magazine-hero group ${className}`}
      role="banner"
      aria-label="Artigo em destaque"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[400px] lg:min-h-[500px]">
        {/* Cover Image - Left 66% */}
        <div className="lg:col-span-2 relative overflow-hidden">
          {issue.cover_image_url ? (
            <img 
              src={issue.cover_image_url}
              alt={`Capa de ${issue.title}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent-blue-400/20 to-accent-blue-600/20 flex items-center justify-center">
              <div className="text-6xl text-accent-blue-400/30 font-serif">
                {issue.title.charAt(0)}
              </div>
            </div>
          )}
          
          {/* Mobile overlay for title */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
          <div className="absolute bottom-6 left-6 lg:hidden">
            <h1 className="text-white text-2xl font-serif font-semibold leading-tight mb-2">
              {issue.title}
            </h1>
            <Button 
              onClick={handleReadClick}
              className="bg-gradient-to-r from-accent-blue-400 to-accent-blue-600 hover:from-accent-blue-500 hover:to-accent-blue-700 text-white rounded-full px-6 py-2 font-medium"
            >
              Ler Artigo
            </Button>
          </div>
        </div>

        {/* Content Panel - Right 34% */}
        <div className="bg-sheet p-8 flex flex-col justify-center hidden lg:flex">
          <div className="space-y-6">
            {/* Issue metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(issue.created_at)}</span>
              </div>
              {issue.authors && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="truncate">{issue.authors}</span>
                </div>
              )}
            </div>

            {/* Specialty badge */}
            {issue.specialty && (
              <div className="inline-block">
                <span className="bg-accent-blue-400/20 text-accent-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {issue.specialty}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-serif font-semibold leading-tight text-balance">
              {issue.title}
            </h1>

            {/* Description */}
            {issue.description && (
              <p className="text-muted-foreground line-clamp-3 text-lg leading-relaxed">
                {issue.description}
              </p>
            )}

            {/* CTA Button */}
            <Button 
              onClick={handleReadClick}
              size="lg"
              className="bg-gradient-to-r from-accent-blue-400 to-accent-blue-600 hover:from-accent-blue-500 hover:to-accent-blue-700 text-white rounded-full px-8 py-3 font-medium self-start shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label={`Ler artigo: ${issue.title}`}
            >
              Ler Artigo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverStackHero;
