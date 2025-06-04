
// ABOUTME: Trending content section component for homepage
// Displays most accessed and popular medical content

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const TrendingSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Mais Acessados
      </h2>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Vacinas e Imunização</CardTitle>
              <Badge variant="destructive">Hot</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Protocolo atualizado de vacinação em adultos.
            </p>
            <p className="text-sm text-gray-500 mt-2">10.2k visualizações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Telemedicina</CardTitle>
              <Badge>Trending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Boas práticas em consultas remotas.
            </p>
            <p className="text-sm text-gray-500 mt-2">8.7k visualizações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Medicina Preventiva</CardTitle>
              <Badge variant="secondary">Popular</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Estratégias de prevenção primária em saúde.
            </p>
            <p className="text-sm text-gray-500 mt-2">7.3k visualizações</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
