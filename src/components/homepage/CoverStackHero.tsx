
// ABOUTME: Netflix-style hero section with stacked covers and scientific diagram background
import React from 'react';
import { Issue } from '@/types/issue';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, User, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArticleActions } from '@/components/article/ArticleActions';

interface CoverStackHeroProps {
  issues: Issue[];
  className?: string;
}

export const CoverStackHero: React.FC<CoverStackHeroProps> = ({ issues, className = '' }) => {
  const navigate = useNavigate();
  
  const featuredIssue = issues?.find(issue => issue.featured) || issues?.[0];
  const stackIssues = issues?.slice(1, 4) || [];

  if (!featuredIssue) {
    return (
      <section className={`section-spacing ${className}`}>
        <div className="hero-gradient scientific-grid rounded-2xl p-12 text-center min-h-[500px] flex items-center justify-center">
          <div className="space-y-4">
            <h2 className="font-journal text-journal-hero text-journal-primary">
              Bem-vindo ao Periódico
            </h2>
            <p className="journal-body max-w-md mx-auto">
              Aguarde novos artigos científicos de alta qualidade.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const handleReadClick = () => {
    navigate(`/article/${featuredIssue.id}`);
  };

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

  return (
    <section className={`section-spacing ${className}`}>
      <div className="hero-gradient scientific-grid rounded-2xl overflow-hidden min-h-[600px] relative">
        {/* Background pattern overlay */}
        <div className="absolute inset-0 hero-background opacity-30" />
        
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 p-12 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            {/* Meta badges */}
            <div className="flex flex-wrap gap-3">
              {featuredIssue.featured && (
                <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                  <Star className="w-3 h-3 mr-1" />
                  Em Destaque
                </Badge>
              )}
              {featuredIssue.specialty && (
                <Badge variant="outline" className="border-journal-border text-journal-secondary">
                  {featuredIssue.specialty.split(', ')[0]}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-journal text-journal-hero text-journal-primary leading-tight">
              {featuredIssue.title}
            </h1>

            {/* Description */}
            {featuredIssue.description && (
              <p className="journal-body text-xl leading-relaxed max-w-lg">
                {featuredIssue.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-6 text-sm text-journal-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(featuredIssue.created_at)}</span>
              </div>
              {featuredIssue.authors && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{featuredIssue.authors}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReadClick}
                className="flex items-center gap-3 bg-journal-primary text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-journal-secondary transition-colors group"
              >
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Ler Artigo
              </button>
              
              <div className="flex-1">
                <ArticleActions articleId={featuredIssue.id} entityType="issue" />
              </div>
            </div>
          </div>

          {/* Visual Side - Cover Stack */}
          <div className="relative">
            {/* Main featured cover */}
            <div className="relative z-30 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-xl shadow-2xl p-1 cover-hover">
                {featuredIssue.cover_image_url ? (
                  <img
                    src={featuredIssue.cover_image_url}
                    alt={featuredIssue.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-journal-accent/20 to-journal-primary/10 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <PlayCircle className="w-16 h-16 text-journal-accent mx-auto" />
                      <p className="font-medium text-journal-secondary">Artigo Científico</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Background stacked covers */}
            {stackIssues.map((issue, index) => (
              <div
                key={issue.id}
                className={`absolute top-0 left-0 w-full transform transition-transform duration-500 hover:scale-105 cursor-pointer`}
                style={{
                  zIndex: 20 - index,
                  transform: `rotate(${-3 + index * 2}deg) translateX(${index * 20}px) translateY(${index * 15}px)`,
                }}
                onClick={() => navigate(`/article/${issue.id}`)}
              >
                <div className="bg-white rounded-xl shadow-xl p-1 opacity-80 hover:opacity-100 transition-opacity">
                  {issue.cover_image_url ? (
                    <img
                      src={issue.cover_image_url}
                      alt={issue.title}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-80 bg-gradient-to-br from-journal-accent/10 to-journal-primary/5 rounded-lg flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-journal-accent/60" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverStackHero;
