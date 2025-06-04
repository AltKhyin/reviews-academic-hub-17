
// ABOUTME: Hero section component with scientific diagram background and featured article overlay
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Calendar, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Issue } from '@/types/issue';
import { ArticleActions } from '@/components/article/ArticleActions';

interface CoverStackHeroProps {
  featuredIssue?: Issue;
  className?: string;
}

export const CoverStackHero: React.FC<CoverStackHeroProps> = ({
  featuredIssue,
  className = ''
}) => {
  if (!featuredIssue) {
    return (
      <section className={`relative h-[70vh] min-h-[500px] w-full overflow-hidden ${className}`}>
        <div className="absolute inset-0 scientific-bg diagram-pattern" />
        <div className="absolute inset-0 scientific-overlay" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-hero font-serif mb-4">Nenhum artigo em destaque</h1>
            <p className="text-xl opacity-80">Aguarde novas publicações</p>
          </div>
        </div>
      </section>
    );
  }

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

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      'Cardiologia': 'bg-red-500/90 text-white',
      'Neurologia': 'bg-purple-500/90 text-white',
      'Oncologia': 'bg-orange-500/90 text-white',
      'Pediatria': 'bg-green-500/90 text-white',
      'Psiquiatria': 'bg-blue-500/90 text-white',
      'Nutrição': 'bg-yellow-500/90 text-black',
    };
    return colors[specialty as keyof typeof colors] || 'bg-gray-500/90 text-white';
  };

  return (
    <section className={`relative h-[70vh] min-h-[500px] w-full overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        {featuredIssue.cover_image_url ? (
          <img 
            src={featuredIssue.cover_image_url}
            alt={featuredIssue.title}
            className="w-full h-full object-cover animate-subtle-pan"
          />
        ) : (
          <div className="w-full h-full scientific-bg diagram-pattern" />
        )}
        <div className="absolute inset-0 scientific-overlay" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Text Content */}
            <div className="space-y-6 text-white">
              {/* Featured Badge */}
              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-500/90 text-yellow-900 hover:bg-yellow-500 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Artigo em Destaque
                </Badge>
                {!featuredIssue.published && (
                  <Badge variant="secondary" className="bg-red-500/90 text-white">
                    Rascunho
                  </Badge>
                )}
              </div>

              {/* Specialty Tags */}
              {featuredIssue.specialty && (
                <div className="flex flex-wrap gap-2">
                  {featuredIssue.specialty.split(', ').slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index} 
                      className={`${getSpecialtyColor(tag.trim())}`}
                    >
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-hero font-serif leading-tight mb-4">
                {featuredIssue.title}
              </h1>

              {/* Description */}
              {featuredIssue.description && (
                <p className="text-xl leading-relaxed opacity-90 max-w-2xl">
                  {featuredIssue.description}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm opacity-80">
                {featuredIssue.authors && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{featuredIssue.authors}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(featuredIssue.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>15 min de leitura</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  asChild
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3"
                >
                  <Link to={`/article/${featuredIssue.id}`} className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Ler Agora
                  </Link>
                </Button>
                
                {/* Article Actions */}
                <div className="flex items-center">
                  <ArticleActions 
                    articleId={featuredIssue.id} 
                    entityType="issue"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Cover Display */}
            <div className="hidden lg:flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg blur-xl scale-105 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-hero transform group-hover:scale-105 transition-transform duration-500">
                  {featuredIssue.cover_image_url ? (
                    <img 
                      src={featuredIssue.cover_image_url}
                      alt={featuredIssue.title}
                      className="w-full h-96 object-cover rounded-lg shadow-xl"
                    />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-400 rounded-lg opacity-50" />
                        <p className="font-medium">Capa não disponível</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
