
import React, { useCallback, useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import ArticleCard from './ArticleCard';
import { useMediaQuery } from '@/hooks/use-mobile';
import type { UseEmblaCarouselType } from 'embla-carousel-react';

interface ArticleRowProps {
  title: string;
  articles: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
  }>;
}

const ArticleRow = ({ title, articles }: ArticleRowProps) => {
  const [carouselApi, setCarouselApi] = useState<UseEmblaCarouselType[1] | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Determine how many slides to show based on screen size
  const slidesPerView = isMobile ? 1 : 3;
  const slideCount = articles.length;
  
  useEffect(() => {
    if (carouselApi) {
      // Configure carousel
      carouselApi.reInit();
    }
  }, [carouselApi, isMobile]);
  
  return (
    <section className="mb-16 first:mt-0 mt-8">
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
          <CarouselContent className="-ml-4">
            {articles.map((article) => (
              <CarouselItem key={article.id} className="pl-4 md:basis-1/3 lg:basis-1/3">
                <ArticleCard article={article} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 md:-left-10 bg-background" />
          <CarouselNext className="-right-4 md:-right-10 bg-background" />
        </Carousel>
      </div>
    </section>
  );
};

export default ArticleRow;
