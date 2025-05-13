
import React from 'react';
import { Button } from '@/components/ui/button';

export type ReportFilterType = 'all' | 'pending' | 'approved' | 'rejected';

interface ReportFilterButtonsProps {
  currentFilter: ReportFilterType;
  onFilterChange: (filter: ReportFilterType) => void;
}

export const ReportFilterButtons: React.FC<ReportFilterButtonsProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={currentFilter === 'pending' ? 'secondary' : 'outline'} 
        size="sm"
        onClick={() => onFilterChange('pending')}
      >
        Pendentes
      </Button>
      <Button 
        variant={currentFilter === 'approved' ? 'secondary' : 'outline'} 
        size="sm"
        onClick={() => onFilterChange('approved')}
      >
        Aprovadas
      </Button>
      <Button 
        variant={currentFilter === 'rejected' ? 'secondary' : 'outline'} 
        size="sm"
        onClick={() => onFilterChange('rejected')}
      >
        Rejeitadas
      </Button>
      <Button 
        variant={currentFilter === 'all' ? 'secondary' : 'outline'} 
        size="sm"
        onClick={() => onFilterChange('all')}
      >
        Todas
      </Button>
    </div>
  );
};
