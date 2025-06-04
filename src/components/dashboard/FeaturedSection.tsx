
import React from 'react';
import { Issue } from '@/types/issue';
import { ArticleCard } from './ArticleCard';
import { Calendar, User, Star, Heart, ThumbsUp, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeaturedSectionProps {
  issues: Issue[];
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ issues }) => {
  const navigate = useNavigate();
  console.log(`FeaturedSection: Rendering with ${issues.length} issues`);

  const featuredIssue = issues?.find(issue => issue.featured);
  const fallbackIssue = issues?.[0];
  const displayIssue = featuredIssue || fallbackIssue;

  if (!displayIssue) {
    console.log("FeaturedSection: No issues to display");
    return (
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-4xl font-serif font-semibold mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Artigo em Destaque
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-blue-500/10 rounded-2xl p-12 text-center backdrop-blur-sm">
          <p className="text-gray-300 text-lg leading-relaxed">
            Nenhum artigo em destaque disponível no momento.
          </p>
        </div>
      </section>
    );
  }

  console.log(`FeaturedSection: Displaying issue ${displayIssue.id} (${featuredIssue ? 'featured' : 'fallback'})`);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('.article-actions')) {
      return;
    }
    navigate(`/article/${displayIssue.id}`);
  };

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-4xl font-serif font-semibold mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Artigo em Destaque
        </h2>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
      
      {/* Hero-style Featured Article */}
      <div 
        className="relative h-96 md:h-[32rem] rounded-3xl overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20"
        onClick={handleClick}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {displayIssue.cover_image_url ? (
            <img 
              src={displayIssue.cover_image_url} 
              alt={displayIssue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30"></div>
          )}
          
          {/* Enhanced Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-8 md:p-12 text-white z-10">
          {/* Featured Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Artigo em Destaque
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-4 tracking-tight drop-shadow-lg">
            {displayIssue.title}
          </h1>
          
          {/* Description */}
          {displayIssue.description && (
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mb-6 leading-relaxed drop-shadow-md">
              {displayIssue.description}
            </p>
          )}
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-gray-300">
            {displayIssue.authors && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{displayIssue.authors}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{formatDate(displayIssue.created_at)}</span>
            </div>
            
            {displayIssue.specialty && (
              <div className="flex items-center">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  {displayIssue.specialty.split(', ')[0]}
                </span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button 
              className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-lg text-lg"
              onClick={handleClick}
            >
              Ler Agora
            </button>
            
            {/* Article Actions */}
            <div className="article-actions flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <button className="p-3 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm">
                <Heart className="w-5 h-5 text-white hover:text-red-400" />
              </button>
              <button className="p-3 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm">
                <ThumbsUp className="w-5 h-5 text-white hover:text-green-400" />
              </button>
              <button className="p-3 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm">
                <Bookmark className="w-5 h-5 text-white hover:text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
