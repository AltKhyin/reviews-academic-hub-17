
// ABOUTME: Upcoming releases section component for homepage
// Displays upcoming medical publications

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const UpcomingSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Próximas Edições
      </h2>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pediatria Especializada</CardTitle>
            <p className="text-sm text-gray-500">Lançamento em 15 de Janeiro</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Novos protocolos para medicina pediátrica preventiva.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medicina de Emergência</CardTitle>
            <p className="text-sm text-gray-500">Lançamento em 22 de Janeiro</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Guias atualizados para atendimento de emergência.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
