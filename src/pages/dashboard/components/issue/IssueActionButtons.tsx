
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface IssueActionButtonsProps {
  onDelete: () => void;
  onTogglePublish: () => void;
  isPublished: boolean;
}

export const IssueActionButtons: React.FC<IssueActionButtonsProps> = ({
  onDelete,
  onTogglePublish,
  isPublished,
}) => {
  return (
    <div className="space-x-2">
      <Button variant="outline" onClick={onDelete} className="text-red-500 hover:text-red-700">
        <Trash className="mr-2 h-4 w-4" /> Excluir
      </Button>
      <Button 
        variant={isPublished ? "outline" : "default"}
        onClick={onTogglePublish}
      >
        {isPublished ? 'Despublicar' : 'Publicar'}
      </Button>
    </div>
  );
};
