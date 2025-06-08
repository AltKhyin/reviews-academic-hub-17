
// ABOUTME: Premium featured issues banner section - Cover-focused with microanimations
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { useNavigate } from 'react-router-dom';
import { HomeIssue } from '@/types/home';
import { Button } from '@/components/ui/button';

export const FeaturedCarouselSection: React.FC = () => {
  const { featuredIssues, isLoading, trackIssueView } = useHomeData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-rotate carousel
  useEffect(() => {
    if (!featuredIssues || featuredIssues.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredIssues.length);
    }, 8000);

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
      <Card className="h-[400px] animate-pulse border-border bg-card overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="h-full bg-muted"></div>
        </CardContent>
      </Card>
    );
  }

  if (!featuredIssues || featuredIssues.length === 0) {
    return null;
  }

  const currentIssue = featuredIssues[currentIndex];

  return (
    <Card className="relative overflow-hidden group cursor-pointer border-border bg-card">
      <CardContent className="p-0">
        <div 
          className="relative h-[400px] flex items-center"
          onClick={() => handleIssueClick(currentIssue)}
        >
          {/* Background Image */}
          {currentIssue.cover_image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${currentIssue.cover_image_url})` }}
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 max-w-2xl px-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-muted text-muted-foreground">
                Edição #{currentIssue.id.slice(-3)}
              </Badge>
              <Badge variant="outline" className="text-white border-white/30">
                {currentIssue.specialty}
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 leading-tight text-white group-hover:text-white/90 transition-colors">
              {currentIssue.title}
            </h1>
            
            {currentIssue.description && (
              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                {currentIssue.description}
              </p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-white/70">
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
            
            <Button 
              className="mt-6 bg-white text-black hover:bg-white/90 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleIssueClick(currentIssue);
              }}
            >
              Ler agora
            </Button>
          </div>
          
          {/* Navigation */}
          {featuredIssues.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              {/* Dots indicator */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {featuredIssues.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
