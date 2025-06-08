
// ABOUTME: Featured issues carousel section for the home page
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, Calendar, User } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { useNavigate } from 'react-router-dom';
import { Issue } from '@/types/issue';

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

  const handleIssueClick = async (issue: Issue) => {
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
          <Star className="w-6 h-6 text-yellow-600" />
          <h2 className="text-2xl font-bold">Edições em Destaque</h2>
        </div>
        <Card className="h-64 animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
          <Star className="w-6 h-6 text-yellow-600" />
          <h2 className="text-2xl font-bold">Edições em Destaque</h2>
        </div>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma edição em destaque no momento.</p>
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
          <Star className="w-6 h-6 text-yellow-600" />
          <h2 className="text-2xl font-bold">Edições em Destaque</h2>
          <Badge variant="secondary">{featuredIssues.length}</Badge>
        </div>
        
        {featuredIssues.length > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Card className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0">
          <div 
            className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 min-h-[300px] flex items-center"
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
                <Badge className="bg-yellow-500 text-black">
                  <Star className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
                <Badge variant="outline" className="text-white border-white">
                  {currentIssue.specialty}
                </Badge>
              </div>
              
              <h3 className="text-3xl font-bold mb-4 leading-tight">
                {currentIssue.title}
              </h3>
              
              {currentIssue.description && (
                <p className="text-lg opacity-90 mb-6 leading-relaxed">
                  {currentIssue.description}
                </p>
              )}
              
              <div className="flex items-center gap-6 text-sm opacity-80">
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
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
