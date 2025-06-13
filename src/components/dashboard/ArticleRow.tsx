
import React, { useCallback, useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { CarouselArticleCard } from './CarouselArticleCard';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Issue } from '@/types/issue';
import type { UseEmblaCarouselType } from 'embla-carousel-react';

interface ArticleRowProps {
  title: string;
  articles: Issue[];
}

const ArticleRow = ({ title, articles }: ArticleRowProps) => {
  const [carouselApi, setCarouselApi] = useState<UseEmblaCarouselType[1] | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Determine how many slides to show based on screen size
  const slidesPerView = isMobile ? 2 : 5;
  
  useEffect(() => {
    if (carouselApi) {
      carouselApi.reInit();
    }
  }, [carouselApi, isMobile]);

  // Add error boundary for carousel rendering
  if (!articles || articles.length === 0) {
    return null;
  }
  
  return (
    <section className="mb-16 first:mt-0 mt-8 w-full">
      <div className="border-t border-white/5 pt-8 first:border-0 first:pt-0">
        <h2 className="text-2xl font-serif mb-6">{title}</h2>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: slidesPerView,
          }}
          className="w-full relative"
          setApi={setCarouselApi}
        >
          <CarouselContent className="-ml-2">
            {articles.map((issue, index) => (
              <CarouselItem key={`${issue.id}-${index}`} className="pl-2 md:basis-1/5 lg:basis-1/5">
                <CarouselArticleCard issue={issue} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-2 md:-left-4 bg-background" />
          <CarouselNext className="-right-2 md:-right-4 bg-background" />
        </Carousel>
      </div>
    </section>
  );
};

export default ArticleRow;
