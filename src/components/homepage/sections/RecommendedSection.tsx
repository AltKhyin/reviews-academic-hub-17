
// ABOUTME: Recommended content section component for homepage
// Displays recommended medical articles and resources

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export const RecommendedSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Star className="w-6 h-6" />
        Recomendados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-yellow-400">
          <CardHeader>
            <CardTitle>Editor's Choice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Artigo essencial sobre medicina baseada em evidências.
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader>
            <CardTitle>Leitura Obrigatória</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Revisão sistemática sobre novos biomarcadores.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
