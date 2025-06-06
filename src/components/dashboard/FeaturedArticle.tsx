
// ABOUTME: Featured article component with consistent color system
// Uses app colors for proper visual identity

import React from 'react';
import { Link } from 'react-router-dom';
import { CSS_VARIABLES } from '@/utils/colorSystem';

interface FeaturedArticleProps {
  article: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
  };
}

const FeaturedArticle = ({ article }: FeaturedArticleProps) => {
  return (
    <section className="w-full h-[500px] relative mb-12">
      <div className="absolute inset-0">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent rounded-lg" />
      </div>
      
      <div className="relative h-full flex items-center px-12 z-10">
        <div className="max-w-2xl">
          <span 
            className="text-sm font-medium px-2 py-1 rounded"
            style={{ 
              color: CSS_VARIABLES.TEXT_SECONDARY, 
              backgroundColor: 'rgba(0, 0, 0, 0.4)' 
            }}
          >
            {article.category}
          </span>
          <h1 className="mt-4 text-5xl font-serif font-medium leading-tight" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
            {article.title}
          </h1>
          <p className="mt-4 text-lg max-w-xl" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
            {article.description}
          </p>
          <Link 
            to={`/article/${article.id}`}
            className="mt-8 inline-block px-6 py-2 rounded-md font-medium hover:opacity-90 transition-colors"
            style={{ 
              backgroundColor: CSS_VARIABLES.TEXT_PRIMARY, 
              color: CSS_VARIABLES.PRIMARY_BG 
            }}
          >
            Ler agora
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticle;
