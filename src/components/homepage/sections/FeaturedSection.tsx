
// ABOUTME: Featured editions section component for homepage
// Displays featured medical content

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const FeaturedSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edições em Destaque</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oncologia Moderna</CardTitle>
              <Badge>Destaque</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Edição especial sobre imunoterapia e tratamentos personalizados.
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Neurologia Avançada</CardTitle>
              <Badge variant="secondary">Popular</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Descobertas recentes em neuroplasticidade e reabilitação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
