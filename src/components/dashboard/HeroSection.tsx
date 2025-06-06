
import React from 'react';
import { Issue } from '@/types/issue';
import { Link } from 'react-router-dom';
import { ArticleActions } from '@/components/article/ArticleActions';

interface HeroSectionProps {
  featuredIssue: Issue;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ featuredIssue }) => {
  console.log('HeroSection: Rendering with featured issue:', featuredIssue.id);

  return (
    <section className="w-full h-[500px] relative mb-12 group">
      <div className="absolute inset-0">
        <img 
          src={featuredIssue.cover_image_url || '/placeholder.svg'} 
          alt={featuredIssue.title}
          className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent rounded-lg transition-all duration-300 group-hover:from-black/70 group-hover:via-black/40"></div>
      </div>
      
      <div className="relative h-full flex items-center px-12 z-10">
        <div className="max-w-2xl text-white">
          <span className="text-sm font-medium text-gray-300 bg-black/40 px-2 py-1 rounded">
            {featuredIssue.specialty || 'FEATURED'}
          </span>
          <h1 className="mt-4 text-5xl font-serif font-medium leading-tight">
            {featuredIssue.title}
          </h1>
          <p className="mt-4 text-lg text-gray-200 max-w-xl">
            {featuredIssue.description || 'Explore this featured content'}
          </p>
          
          <div className="mt-6 flex flex-col gap-4">
            <ArticleActions 
              articleId={featuredIssue.id} 
              entityType="issue"
            />
            
            <Link 
              to={`/article/${featuredIssue.id}`}
              className="inline-block bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors w-fit"
            >
              Ler agora
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
