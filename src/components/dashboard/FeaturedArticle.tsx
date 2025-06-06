
import React from 'react';
import { Link } from 'react-router-dom';

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
        <div className="max-w-2xl text-white">
          <span className="text-sm font-medium text-gray-300 bg-black/40 px-2 py-1 rounded">
            {article.category}
          </span>
          <h1 className="mt-4 text-5xl font-serif font-medium leading-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-gray-200 max-w-xl">
            {article.description}
          </p>
          <Link 
            to={`/article/${article.id}`}
            className="mt-8 inline-block bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Ler agora
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticle;
