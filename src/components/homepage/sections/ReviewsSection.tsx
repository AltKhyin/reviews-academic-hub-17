
// ABOUTME: Reviews section component for homepage
// Displays editor reviews content

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ReviewsSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reviews do Editor</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Review em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Análise detalhada dos últimos estudos em cardiologia.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revisão Clínica</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Novos protocolos para tratamento de diabetes.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pesquisa Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Avanços em medicina personalizada.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
