
// ABOUTME: Recent editions section component for homepage
// Displays recently published medical content

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export const RecentSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Edições Recentes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dermatologia Clínica</CardTitle>
            <p className="text-sm text-gray-500">Publicado há 2 dias</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Novas técnicas de diagnóstico dermatológico.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endocrinologia</CardTitle>
            <p className="text-sm text-gray-500">Publicado há 5 dias</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Tratamentos inovadores para diabetes tipo 2.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medicina Interna</CardTitle>
            <p className="text-sm text-gray-500">Publicado há 1 semana</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Abordagens multidisciplinares em medicina interna.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
