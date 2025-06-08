
// ABOUTME: Reviewer notes section component for homepage
// Displays reviewer comments and notes

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ReviewerNotesSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notas do Revisor</h2>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nota Editorial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Considerações importantes sobre os novos guidelines de hipertensão.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comentário Técnico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Análise metodológica dos estudos sobre COVID-19.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
