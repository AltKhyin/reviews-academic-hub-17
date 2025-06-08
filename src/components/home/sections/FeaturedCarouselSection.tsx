
// ABOUTME: Featured issues carousel section for the home page - Monochromatic design compliant
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, Calendar, User } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { useNavigate } from 'react-router-dom';
import { HomeIssue } from '@/types/home';

export const FeaturedCarouselSection: React.FC = () => {
  const { featuredIssues, isLoading, trackIssueView } = useHomeData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-rotate carousel
  useEffect(() => {
    if (!featuredIssues || featuredIssues.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredIssues.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredIssues]);

  const handleIssueClick = async (issue: HomeIssue) => {
    try {
      await trackIssueView({ issueId: issue.id });
    } catch (error) {
      console.log('Failed to track view:', error);
    }
    navigate(`/article/${issue.id}`);
  };

  const nextSlide = () => {
    if (featuredIssues) {
      setCurrentIndex((prev) => (prev + 1) % featuredIssues.length);
    }
  };

  const prevSlide = () => {
    if (featuredIssues) {
      setCurrentIndex((prev) => (prev - 1 + featuredIssues.length) % featuredIssues.length);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-warning" />
          <h2 className="text-2xl font-bold text-foreground">Edições em Destaque</h2>
        </div>
        <Card className="h-64 animate-pulse border-border bg-card">
          <CardContent className="p-6">
            <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/60 rounded w-full"></div>
              <div className="h-4 bg-muted/60 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!featuredIssues || featuredIssues.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-warning" />
          <h2 className="text-2xl font-bold text-foreground">Edições em Destaque</h2>
        </div>
        <Card className="border-dashed border-border bg-card">
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma edição em destaque no momento.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentIssue = featuredIssues[currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-warning" />
          <h2 className="text-2xl font-bold text-foreground">Edições em Destaque</h2>
          <Badge variant="secondary">{featuredIssues.length}</Badge>
        </div>
        
        {featuredIssues.length > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              className="w-8 h-8 p-0 border-border hover:bg-accent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              className="w-8 h-8 p-0 border-border hover:bg-accent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Card className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 border-border bg-card">
        <CardContent className="p-0">
          <div 
            className="relative bg-gradient-to-r from-secondary to-accent text-primary-foreground p-8 min-h-[300px] flex items-center"
            onClick={() => handleIssueClick(currentIssue)}
          >
            {currentIssue.cover_image_url && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${currentIssue.cover_image_url})` }}
              />
            )}
            
            <div className="relative z-10 max-w-4xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-warning text-background">
                  <Star className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
                <Badge variant="outline" className="text-primary-foreground border-primary-foreground">
                  {currentIssue.specialty}
                </Badge>
              </div>
              
              <h3 className="text-3xl font-bold mb-4 leading-tight text-primary-foreground">
                {currentIssue.title}
              </h3>
              
              {currentIssue.description && (
                <p className="text-lg opacity-90 mb-6 leading-relaxed text-primary-foreground">
                  {currentIssue.description}
                </p>
              )}
              
              <div className="flex items-center gap-6 text-sm opacity-80 text-primary-foreground">
                {currentIssue.authors && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{currentIssue.authors}</span>
                  </div>
                )}
                
                {currentIssue.published_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(currentIssue.published_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        {featuredIssues.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-1">
            {featuredIssues.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary-foreground' 
                    : 'bg-primary-foreground/50 hover:bg-primary-foreground/75'
                }`}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
