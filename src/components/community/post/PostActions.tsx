
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MessageSquare, BookmarkPlus, Flag, Trash, Pin, PinOff, Bookmark } from 'lucide-react';
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
    <div className="flex items-center space-x-1">
      {/* Comments button with count */}
      <Button 
        variant="ghost" 
        size="sm" 
        className={`h-8 px-2 text-gray-400 hover:text-white ${showComments ? 'text-white' : ''}`}
        onClick={onToggleComments}
      >
        <MessageSquare className="h-4 w-4" />
        {commentCount > 0 && (
          <span className="ml-1 text-xs">
            {commentCount}
          </span>
        )}
      </Button>
      
      {/* Bookmark button */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${isBookmarked ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-white'}`}
        onClick={handleBookmark}
        disabled={isBookmarking}
        title="Salvar"
      >
        {isBookmarked ? <Bookmark className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
      </Button>

      {/* Admin pin button */}
      {isAdmin && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${isPinned ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-white'}`}
          onClick={handlePinToggle}
          disabled={pinPost.isPending || unpinPost.isPending}
          title={isPinned ? 'Desafixar' : 'Fixar'}
        >
          {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </Button>
      )}

      {/* Report button */}
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-500"
        onClick={onReport}
        title="Denunciar"
      >
        <Flag className="h-4 w-4" />
      </Button>

      {/* Delete button for post author or admin */}
      {user && (user.id === userId || isAdmin) && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
          onClick={onDelete}
          title="Excluir"
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
