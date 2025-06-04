
// ABOUTME: Intelligent carousel for recommended and popular content sections
// Features snap-scroll, lazy loading, progress indicators, and accessibility

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '@/types/issue';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SmartCarouselProps {
  title: string;
  issues: Issue[];
  kind: 'recommended' | 'popular' | 'trending';
  isLoading?: boolean;
  className?: string;
}

const CarouselCard: React.FC<{ issue: Issue; index: number }> = ({ issue, index }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/article/${issue.id}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return '--/--';
    }
  };

  return (
    <div 
      className="carousel-card flex-shrink-0 w-40 cursor-pointer group"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Artigo: ${issue.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Mini Cover */}
      <div className="aspect-[3/4] mb-3 rounded-lg overflow-hidden shadow-paper group-hover:shadow-lg transition-all duration-300">
        {issue.cover_image_url ? (
          <img 
            src={issue.cover_image_url}
            alt={`Capa de ${issue.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent-blue-400/10 to-accent-blue-600/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-accent-blue-400/40" />
          </div>
        )}
        
        {/* Status badge */}
        {issue.featured && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-500/90 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
              Destaque
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Specialty */}
        {issue.specialty && (
          <span className="inline-block bg-accent-blue-400/20 text-accent-blue-300 px-2 py-1 rounded-full text-xs font-medium">
            {issue.specialty}
          </span>
        )}

        {/* Title */}
        <h3 className="font-serif font-medium text-sm leading-tight line-clamp-2 text-foreground group-hover:text-accent-blue-400 transition-colors">
          {issue.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(issue.created_at)}</span>
          {issue.authors && (
            <span className="truncate max-w-20">{issue.authors}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const CarouselSkeleton: React.FC = () => (
  <div className="flex gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="flex-shrink-0 w-40">
        <div className="aspect-[3/4] mb-3 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-16 animate-pulse" />
          <div className="h-4 bg-muted rounded w-full animate-pulse" />
          <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export const SmartCarousel: React.FC<SmartCarouselProps> = ({ 
  title,
  issues, 
  kind,
  isLoading = false, 
  className = '' 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const cardWidth = 176; // 160px + 16px gap
    scrollRef.current.scrollBy({ left: -cardWidth * 3, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    const cardWidth = 176;
    scrollRef.current.scrollBy({ left: cardWidth * 3, behavior: 'smooth' });
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', checkScrollButtons);
    checkScrollButtons();

    return () => scrollElement.removeEventListener('scroll', checkScrollButtons);
  }, [issues]);

  if (isLoading) {
    return (
      <section className={`${className}`} aria-label={`Carregando ${title.toLowerCase()}`}>
        <div className="max-w-magazine mx-auto px-6">
          <h2 className="text-2xl font-serif font-semibold mb-6">{title}</h2>
          <CarouselSkeleton />
        </div>
      </section>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <section className={`${className}`} aria-label={title}>
        <div className="max-w-magazine mx-auto px-6">
          <h2 className="text-2xl font-serif font-semibold mb-6">{title}</h2>
          <div className="bg-muted/20 rounded-xl p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum conteúdo {kind === 'recommended' ? 'recomendado' : 'popular'} disponível no momento.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${className}`} aria-label={title}>
      <div className="max-w-magazine mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-semibold">{title}</h2>
          
          {/* Navigation buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Próximo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {issues.map((issue, index) => (
              <div key={issue.id} className="snap-start">
                <CarouselCard issue={issue} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: Math.ceil(issues.length / 6) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / 6) === index 
                  ? 'bg-accent-blue-400' 
                  : 'bg-border'
              }`}
              aria-label={`Ir para página ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartCarousel;
