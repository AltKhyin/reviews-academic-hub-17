
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Trash } from 'lucide-react';

interface IssueActionButtonsProps {
  onDelete: () => void;
  onTogglePublish: () => void;
  onToggleFeatured?: () => void;
  isPublished: boolean;
  isFeatured?: boolean;
  isDisabled?: boolean;
}

export const IssueActionButtons: React.FC<IssueActionButtonsProps> = ({
  onDelete,
  onTogglePublish,
  onToggleFeatured,
  isPublished,
  isFeatured,
  isDisabled
}) => {
  return (
    <div className="space-x-2">
      {onToggleFeatured && (
        <Button 
          variant="outline" 
          onClick={onToggleFeatured}
          disabled={isDisabled}
          className={isFeatured ? "text-yellow-500 hover:text-yellow-700" : "text-muted-foreground"}
        >
          <Star className="mr-2 h-4 w-4" /> {isFeatured ? 'Destacada' : 'Destacar'}
        </Button>
      )}
      <Button 
        variant="outline" 
        onClick={onDelete} 
        disabled={isDisabled}
        className="text-red-500 hover:text-red-700"
      >
        <Trash className="mr-2 h-4 w-4" /> Excluir
      </Button>
      <Button 
        variant={isPublished ? "outline" : "default"}
        onClick={onTogglePublish}
        disabled={isDisabled}
      >
        {isPublished ? 'Despublicar' : 'Publicar'}
      </Button>
    </div>
  );
};
