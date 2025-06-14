import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PostData } from '@/types/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pin, BookmarkPlus, Flag, Trash, PinOff, Bookmark, EyeOff, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PostContent } from '@/components/community/PostContent';
import { PostVotingIntegrated } from '@/components/community/PostVotingIntegrated';
import { IssueDiscussionBanner } from '@/components/community/post/IssueDiscussionBanner';
import { usePinPost, useUnpinPost } from '@/hooks/useIssueDiscussion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommentSection } from '@/components/comments/CommentSection';

interface PostProps {
  post: PostData;
  onVoteChange: () => void; // This will trigger a refetch of the RPC data
}

export const Post: React.FC<PostProps> = ({ post, onVoteChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showHideDialog, setShowHideDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  // COMMENT COUNT: Not yet in RPC, keeping existing fetch.
  const [commentCount, setCommentCount] = useState(0);
  useEffect(() => {
    if (!post.id) return;
    
    const fetchCommentCount = async () => {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
        
      if (!error && count !== null) {
        setCommentCount(count);
      }
    };
    
    fetchCommentCount();
  }, [post.id]);

  // IS ADMIN: User-specific, not post-specific from RPC. Keeping existing fetch.
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    
    const checkAdminStatus = async () => {
      const { data } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      setIsAdmin(!!data);
    };
    
    checkAdminStatus();
  }, [user]);

  // IS BOOKMARKED: User-specific per post, not yet in RPC. Keeping existing fetch.
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  useEffect(() => {
    if (!user || !post.id) {
      setIsBookmarked(false);
      return;
    }
    
    const checkBookmarkStatus = async () => {
      const { data } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      setIsBookmarked(!!data);
    };
    
    checkBookmarkStatus();
  }, [user, post.id]);

  const [isHidden, setIsHidden] = useState(false);

  const pinPost = usePinPost(); // These hooks manage their own state and API calls
  const unpinPost = useUnpinPost();

  const formatPostDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
        
      if (error) throw error;
      
      toast({
        title: "Post excluído",
        description: "A publicação foi excluída com sucesso.",
      });
      
      onVoteChange(); // Trigger refetch of posts list
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a publicação.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReport = () => {
    toast({
      title: "Denúncia enviada",
      description: "Obrigado por ajudar a manter a comunidade saudável.",
    });
    setShowReportDialog(false);
  };

  const handleHide = () => {
    setIsHidden(true);
    toast({
      title: "Post ocultado",
      description: "Este post foi ocultado da sua timeline.",
    });
    setShowHideDialog(false);
  };

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
          .eq('post_id', post.id)
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
            post_id: post.id,
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
    if (post.pinned) {
      // onVoteChange will be called by the mutation's onSuccess if needed by usePinPost/useUnpinPost
      unpinPost.mutate(post.id, { onSuccess: onVoteChange }); 
    } else {
      pinPost.mutate({ postId: post.id, pinDurationDays: post.pin_duration_days || 7 }, { onSuccess: onVoteChange });
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handlePollVoteChange = () => {
    console.log("Poll vote changed, refreshing post data via onVoteChange");
    onVoteChange(); // This now triggers a refetch of the RPC in useCommunityPosts
  };

  // Data for post.profiles and post.post_flairs now comes directly from the `post` prop (from RPC)
  // post.userVote also comes from the `post` prop

  const isIssueDiscussion = post.post_flairs?.name === 'Discussão de Edição';

  if (isHidden) {
    return null;
  }

  return (
    <div className="py-6">
      {/* Pinned indicator */}
      {post.pinned && (
        <div className="flex items-center mb-3 text-yellow-500 text-sm">
          <Pin className="h-4 w-4 mr-1" />
          <span>Fixado por admin</span>
        </div>
      )}

      <div className="flex items-start space-x-4">
        {/* Voting component uses initialUserVote from post prop */}
        {/* <PostVoting postId={post.id} initialScore={post.score || 0} initialUserVote={post.userVote || 0} onVoteChange={onVoteChange} /> */}
        
        <div className="flex-1 min-w-0">
          {/* Header with user info and top-right actions */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-3">
                <AvatarImage src={post.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {post.profiles?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300">
                {post.profiles?.full_name || 'Usuário'}
                <span className="mx-1">•</span>
                {formatPostDate(post.created_at)}
              </span>
            </div>

            {/* Top-right action cluster */}
            <div className="flex items-center space-x-1">
              {/* Bookmark button - uses local isBookmarked state */}
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isBookmarked ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-white'}`}
                onClick={handleBookmark}
                disabled={isBookmarking}
                title="Salvar"
              >
                {isBookmarked ? <Bookmark className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
              </Button>

              {/* Report button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-500"
                onClick={() => setShowReportDialog(true)}
                title="Denunciar"
              >
                <Flag className="h-5 w-5" />
              </Button>

              {/* Hide button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-500"
                onClick={() => setShowHideDialog(true)}
                title="Ocultar"
              >
                <EyeOff className="h-5 w-5" />
              </Button>

              {/* Admin pin button - uses local isAdmin state */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${post.pinned ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-white'}`}
                  onClick={handlePinToggle}
                  disabled={pinPost.isPending || unpinPost.isPending}
                  title={post.pinned ? 'Desafixar' : 'Fixar'}
                >
                  {post.pinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
                </Button>
              )}

              {/* Delete button for post author or admin - uses local isAdmin state */}
              {user && (user.id === post.user_id || isAdmin) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  onClick={() => setShowDeleteDialog(true)}
                  title="Excluir"
                >
                  <Trash className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-medium leading-tight mb-2">{post.title}</h3>
          
          {/* Flair - uses post.post_flairs from RPC */}
          {post.post_flairs && (
            <Badge 
              style={{ backgroundColor: post.post_flairs.color }}
              className="text-xs mb-3"
            >
              {post.post_flairs.name}
            </Badge>
          )}
          
          {/* Content - post.poll from RPC is passed to PostContent */}
          <PostContent post={post} onVoteChange={handlePollVoteChange} />

          {/* Issue Discussion Banner */}
          {isIssueDiscussion && post.issue_id && (
            <IssueDiscussionBanner issueId={post.issue_id} />
          )}
          
          {/* Bottom-left action cluster - voting and comments */}
          <div className="flex items-center space-x-2 mt-4">
            {/* Voting component - integrated and tightly grouped */}
            <PostVotingIntegrated
              postId={post.id}
              initialScore={post.score || 0}
              initialUserVote={post.userVote || 0} // userVote now comes from RPC via post prop
              onVoteChange={onVoteChange} // Triggers RPC refetch
            />

            {/* Comments button - uses local commentCount state */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-3 text-gray-400 hover:text-white ${showComments ? 'text-white bg-gray-700/30' : ''}`}
              onClick={toggleComments}
            >
              <MessageSquare className="h-5 w-5" />
              {commentCount > 0 && (
                <span className="ml-2 text-sm">
                  {commentCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <CommentSection postId={post.id} />
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir publicação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Denunciar publicação</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja denunciar esta publicação por conteúdo inadequado? Nossa equipe irá avaliar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReport}>Denunciar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hide Dialog */}
      <AlertDialog open={showHideDialog} onOpenChange={setShowHideDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ocultar publicação</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja ocultar esta publicação da sua timeline? Você poderá desfazer esta ação posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleHide}>Ocultar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
