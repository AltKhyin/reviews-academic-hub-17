
import { Button } from '@/components/ui/button';
import { Bookmark, Edit, Trash, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ArticleCardActionsProps {
  id: string;
  isBookmarked: boolean;
  hasLiked: boolean;
  isAdmin: boolean;
  isDeleting: boolean;
  isLoadingBookmark: boolean;
  isLoadingReactions: boolean;
  onToggleBookmark: () => void;
  onToggleLike: () => void;
  onDelete: () => void;
}

export const ArticleCardActions = ({
  id,
  isBookmarked,
  hasLiked,
  isAdmin,
  isDeleting,
  isLoadingBookmark,
  isLoadingReactions,
  onToggleBookmark,
  onToggleLike,
  onDelete
}: ArticleCardActionsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is authenticated before allowing interaction
  const handleAuthAction = (callback: () => void) => {
    if (!user) {
      navigate('/login');
      return;
    }
    callback();
  };
  
  return (
    <div className="flex items-center gap-1 mt-2">
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoadingBookmark}
        onClick={() => handleAuthAction(onToggleBookmark)}
        className={isBookmarked ? 'text-blue-600' : ''}
        title={isBookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      >
        <Bookmark size={16} />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoadingReactions}
        onClick={() => handleAuthAction(onToggleLike)}
        className={hasLiked ? 'text-green-600' : ''}
        title={hasLiked ? 'Remover curtida' : 'Curtir'}
      >
        <ThumbsUp size={16} />
      </Button>
      
      {isAdmin && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/edit/${id}`)}
            title="Editar"
          >
            <Edit size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-500"
            title="Excluir"
          >
            <Trash size={16} />
          </Button>
        </>
      )}
    </div>
  );
};
