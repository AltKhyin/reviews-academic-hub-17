
// ABOUTME: Netflix-style horizontal scrolling carousel with smooth interactions
import React, { useRef, useState, useEffect } from 'react';
import { Issue } from '@/types/issue';
import { ChevronLeft, ChevronRight, Calendar, User, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArticleActions } from '@/components/article/ArticleActions';

interface SmartCarouselProps {
  title: string;
  issues: Issue[];
  featuredIssueId?: string;
  className?: string;
}

export const SmartCarousel: React.FC<SmartCarouselProps> = ({
  title,
  issues,
  featuredIssueId,
  className = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter out featured issue to avoid duplication
  const filteredIssues = featuredIssueId 
    ? issues.filter(issue => issue.id !== featuredIssueId)
    : issues;

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
  }, [filteredIssues]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 320; // Width of one card + gap
    const newScrollLeft = direction === 'left' 
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (!filteredIssues || filteredIssues.length === 0) {
    return (
      <section className={`section-spacing ${className}`}>
        <h2 className="font-journal text-journal-heading text-journal-primary mb-8">
          {title}
        </h2>
        <div className="bg-journal-surface border border-journal-border rounded-xl p-8 text-center">
          <p className="journal-body text-journal-muted">
            Nenhum artigo disponível nesta seção no momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`section-spacing ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-journal text-journal-heading text-journal-primary">
          {title}
        </h2>
        
        {/* Navigation Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-2 rounded-full bg-journal-surface border border-journal-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-journal-border transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-2 rounded-full bg-journal-surface border border-journal-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-journal-border transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="carousel-container">
        <div
          ref={scrollRef}
          className="carousel-track scrollbar-hide overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="flex-none w-80 group cursor-pointer"
              onMouseEnter={() => setHoveredCard(issue.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(`/article/${issue.id}`)}
            >
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-journal-border">
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden">
                  {issue.cover_image_url ? (
                    <img
                      src={issue.cover_image_url}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-journal-accent/20 to-journal-primary/10 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-journal-accent/30 rounded-lg flex items-center justify-center mx-auto">
                          <Star className="w-6 h-6 text-journal-accent" />
                        </div>
                        <p className="text-sm text-journal-secondary font-medium">Artigo</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  {hoveredCard === issue.id && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center animate-fade-in">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
                        <p className="text-sm font-medium text-journal-primary">Ler Artigo</p>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {issue.featured && (
                      <Badge className="bg-yellow-500/90 text-yellow-900 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                    {!issue.published && (
                      <Badge variant="secondary" className="bg-gray-500/90 text-white text-xs">
                        Rascunho
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Specialty */}
                  {issue.specialty && (
                    <div className="flex flex-wrap gap-2">
                      {issue.specialty.split(', ').slice(0, 2).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs border-journal-border text-journal-secondary"
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Title */}
                  <h3 className="font-journal text-lg font-semibold text-journal-primary line-clamp-2 group-hover:text-journal-accent transition-colors">
                    {issue.title}
                  </h3>
                  
                  {/* Description */}
                  {issue.description && (
                    <p className="journal-body text-sm line-clamp-2 text-journal-muted">
                      {issue.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-journal-muted pt-2 border-t border-journal-border">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(issue.created_at)}</span>
                    </div>
                    
                    {issue.authors && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-20">{issue.authors}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions - shown on hover */}
                  {hoveredCard === issue.id && (
                    <div className="animate-fade-in pt-3 border-t border-journal-border" onClick={(e) => e.stopPropagation()}>
                      <ArticleActions articleId={issue.id} entityType="issue" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartCarousel;
