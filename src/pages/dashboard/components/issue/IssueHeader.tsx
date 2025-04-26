
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IssueHeader = () => {
  const navigate = useNavigate();
  
  return (
    <Button variant="ghost" onClick={() => navigate('/edit')} className="mb-4">
      <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
    </Button>
  );
};
