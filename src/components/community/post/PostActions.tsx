
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MessageSquare, BookmarkPlus, Flag, Trash, Pin, PinOff } from 'lucide-react';
import { usePinPost, useUnpinPost } from '@/hooks/useIssueDiscussion';

interface PostActionsProps {
  postId: string;
  userId: string;
  isPinned: boolean;
  showComments: boolean;
  commentCount: number;
  onToggleComments: () => void;
  onVoteChange: () => void;
  onReport: () => void;
  onDelete: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  postId,
  userId,
  isPinned,
  showComments,
  commentCount,
  onToggleComments,
  onVoteChange,
  onReport,
  onDelete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const pinPost = usePinPost();
  const unpinPost = useUnpinPost();

  useEffect(() => {
    if (!user) return;
    
    const checkAdminStatus = async () => {
      const { data } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      setIsAdmin(!!data);
    };
    
    checkAdminStatus();

    const checkBookmarkStatus = async () => {
      const { data } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      setIsBookmarked(!!data);
    };
    
    checkBookmarkStatus();
  }, [user, postId]);

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para salvar publicações.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBookmarking(true);
      
      if (isBookmarked) {
        await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        setIsBookmarked(false);
        
        toast({
          title: "Publicação removida dos salvos",
          description: "A publicação foi removida dos seus salvos.",
        });
      } else {
        await supabase
          .from('post_bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id
          });
          
        setIsBookmarked(true);
        
        toast({
          title: "Publicação salva",
          description: "A publicação foi adicionada aos seus salvos.",
        });
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a publicação.",
        variant: "destructive",
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handlePinToggle = async () => {
    if (isPinned) {
      unpinPost.mutate(postId);
    } else {
      pinPost.mutate({ postId, pinDurationDays: 7 });
    }
  };

  return (
    <div className="flex mt-4 space-x-2 items-center">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`text-gray-400 hover:text-white ${showComments ? 'text-white' : ''}`}
        onClick={onToggleComments}
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        Comentários
        {!showComments && commentCount > 0 && (
          <span className="ml-1 text-xs bg-gray-700/50 px-1.5 py-0.5 rounded-full">
            {commentCount}
          </span>
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`text-gray-400 ${isBookmarked ? 'text-blue-500 hover:text-blue-600' : 'hover:text-white'}`}
        onClick={handleBookmark}
        disabled={isBookmarking}
      >
        <BookmarkPlus className="h-4 w-4 mr-1" />
        Salvar
      </Button>

      {isAdmin && (
        <Button
          variant="ghost"
          size="sm"
          className={`text-gray-400 ${isPinned ? 'text-yellow-500 hover:text-yellow-600' : 'hover:text-white'}`}
          onClick={handlePinToggle}
          disabled={pinPost.isPending || unpinPost.isPending}
        >
          {isPinned ? <PinOff className="h-4 w-4 mr-1" /> : <Pin className="h-4 w-4 mr-1" />}
          {isPinned ? 'Desafixar' : 'Fixar'}
        </Button>
      )}

      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-500"
        onClick={onReport}
      >
        <Flag className="h-4 w-4" />
        <span className="sr-only">Denunciar</span>
      </Button>

      {user && (user.id === userId || isAdmin) && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-red-500 ml-auto"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4 mr-1" />
          Excluir
        </Button>
      )}
    </div>
  );
};
