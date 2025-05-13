
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flag } from 'lucide-react';
import { ReportFilterType } from './ReportFilterButtons';

interface EmptyReportStateProps {
  filter: ReportFilterType;
}

export const EmptyReportState: React.FC<EmptyReportStateProps> = ({ filter }) => {
  const getFilterText = () => {
    if (filter === 'all') return '';
    if (filter === 'pending') return 'pendente';
    if (filter === 'approved') return 'aprovada';
    return 'rejeitada';
  };

  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Flag className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-400">
          Nenhuma denúncia {getFilterText()} encontrada.
        </p>
      </CardContent>
    </Card>
  );
};
