
// ABOUTME: Horizontal scrolling carousel component for Netflix-style article display
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleCard } from '@/components/dashboard/ArticleCard';
import { Issue } from '@/types/issue';

interface SmartCarouselProps {
  title: string;
  subtitle?: string;
  items: Issue[];
  featuredIssueId?: string;
  className?: string;
}

export const SmartCarousel: React.FC<SmartCarouselProps> = ({
  title,
  subtitle,
  items,
  featuredIssueId,
  className = ''
}) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    const cardWidth = 320; // Approximate width including gap
    const scrollAmount = cardWidth * 3; // Scroll 3 cards at a time
    
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    
    // Update arrow visibility after scroll animation
    setTimeout(checkScrollPosition, 300);
  };

  React.useEffect(() => {
    checkScrollPosition();
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="px-6 lg:px-8">
          <h2 className="netflix-title mb-6">{title}</h2>
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum artigo disponível nesta seção.</p>
          </div>
        </div>
      </section>
    );
  }

  // Filter out featured issue to avoid duplication
  const displayItems = featuredIssueId 
    ? items.filter(item => item.id !== featuredIssueId)
    : items;

  return (
    <section className={`py-8 ${className}`}>
      <div className="px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="netflix-title">{title}</h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Arrow */}
          {showLeftArrow && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border-0 h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border-0 h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Scrollable Content */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            onScroll={checkScrollPosition}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayItems.map((issue, index) => (
              <div
                key={`${issue.id}-${index}`}
                className="flex-none w-80"
              >
                <ArticleCard
                  issue={issue}
                  variant="default"
                  className="h-64 netflix-card scientific-card"
                />
              </div>
            ))}
            
            {/* Add spacing at the end */}
            <div className="flex-none w-6" />
          </div>
        </div>
      </div>
    </section>
  );
};
