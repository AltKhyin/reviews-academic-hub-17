
// ABOUTME: Featured editions section component for homepage
// Displays featured medical content using real data
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const FeaturedSection: React.FC = () => {
  const { featuredIssue, isLoading } = useParallelDataLoader();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!featuredIssue) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Edição em Destaque</h2>
        <Card className="border-2 border-blue-200">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">
              Nenhuma edição em destaque disponível no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edição em Destaque</h2>
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{featuredIssue.title}</CardTitle>
            <Badge>Destaque</Badge>
          </div>
          {featuredIssue.specialty && (
            <p className="text-sm text-gray-500">{featuredIssue.specialty}</p>
          )}
        </CardHeader>
        <CardContent>
          {featuredIssue.cover_image_url && (
            <img 
              src={featuredIssue.cover_image_url} 
              alt={featuredIssue.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          <p className="text-gray-600">
            {featuredIssue.description || 'Edição especial com conteúdo destacado.'}
          </p>
          {featuredIssue.authors && (
            <p className="text-sm text-gray-500 mt-2">
              Autores: {featuredIssue.authors}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
