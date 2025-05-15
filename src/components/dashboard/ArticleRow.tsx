
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ArticleCard } from './ArticleCard';

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
  return (
    <section className="mb-16 first:mt-0 mt-8">
      <div className="border-t border-white/5 pt-8 first:border-0 first:pt-0">
        <h2 className="text-2xl font-serif mb-6">{title}</h2>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {articles.map((article) => (
              <CarouselItem key={article.id} className="pl-4 md:basis-auto flex-shrink-0">
                <ArticleCard 
                  issue={{
                    id: article.id,
                    title: article.title,
                    description: article.description,
                    cover_image_url: article.image,
                    specialty: article.category,
                    // Add the missing required properties from Issue type
                    pdf_url: '',  // Add default empty string
                    published: true, // Assuming the articles are published
                    created_at: new Date().toISOString(), // Current date as ISO string
                    updated_at: new Date().toISOString(), // Current date as ISO string
                    featured: false // Default to false for non-featured
                  }}
                  className="w-[280px] h-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </section>
  );
};

export default ArticleRow;
