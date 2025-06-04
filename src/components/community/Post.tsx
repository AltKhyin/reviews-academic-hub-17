import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PostData } from '@/types/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, MessageSquare, Trash, BookmarkPlus, Flag, Pin, PinOff, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PostContent } from '@/components/community/PostContent';
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
import { useNavigate } from 'react-router-dom';
import { usePinPost, useUnpinPost } from '@/hooks/useIssueDiscussion';

interface PostProps {
  post: PostData;
  onVoteChange: () => void;
}

export const Post: React.FC<PostProps> = ({ post, onVoteChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [localScore, setLocalScore] = useState(post.score || 0);
  const [localUserVote, setLocalUserVote] = useState(post.userVote || 0);
  const [issueCoverUrl, setIssueCoverUrl] = useState<string | null>(null);

  const pinPost = usePinPost();
  const unpinPost = useUnpinPost();

  // Helper function to format dates
  const formatPostDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  // Fetch issue cover if this is an issue discussion post
  useEffect(() => {
    if (post.issue_id) {
      const fetchIssueCover = async () => {
        const { data, error } = await supabase
          .from('issues')
          .select('cover_image_url')
          .eq('id', post.issue_id)
          .single();
        
        if (data?.cover_image_url) {
          setIssueCoverUrl(data.cover_image_url);
        }
      };
      
      fetchIssueCover();
    }
  }, [post.issue_id]);

  // Check if user is admin
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

    // Check if post is bookmarked
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

  // Synchronize local state when post prop changes
  useEffect(() => {
    if (post) {
      setLocalScore(post.score || 0);
      setLocalUserVote(post.userVote || 0);
    }
  }, [post.score, post.userVote]);

  // Add code to count comments without auto-upvoting own posts
  useEffect(() => {
    if (!post.id) return;
    
    // Get comment count when post is loaded
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

  const handleVote = async (value: number) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar em publicações.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVoting(true);
      
      // Optimistic UI update
      const currentVote = localUserVote;
      
      // Calculate the new vote value
      // If clicking on the same vote button, remove the vote (toggle to 0)
      const newVote = currentVote === value ? 0 : value;
      
      // Calculate score delta for optimistic update
      let scoreDelta = 0;
      
      if (currentVote === newVote) {
        // No change needed
        scoreDelta = 0;
      } else if (newVote === 0) {
        // Removing vote: subtract current vote
        scoreDelta = -currentVote;
      } else if (currentVote === 0) {
        // Adding new vote: add new vote
        scoreDelta = newVote;
      } else {
        // Changing vote direction: subtract old and add new
        scoreDelta = newVote - currentVote;
      }
      
      // Update local state optimistically
      setLocalUserVote(newVote);
      setLocalScore(prevScore => prevScore + scoreDelta);
      
      const { data, error } = await supabase
        .from('post_votes')
        .select('value')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (newVote === 0) {
          // Remove vote if toggling off
          await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', post.id)
            .eq('user_id', user.id);
        } else {
          // Update vote
          await supabase
            .from('post_votes')
            .update({ value: newVote })
            .eq('post_id', post.id)
            .eq('user_id', user.id);
        }
      } else if (newVote !== 0) {
        // Insert new vote only if not zero
        await supabase
          .from('post_votes')
          .insert({ post_id: post.id, user_id: user.id, value: newVote });
      }

      // Wait a brief moment to allow the trigger to update the score
      setTimeout(() => {
        // Refresh posts data to get updated scores
        onVoteChange();
      }, 300);
    } catch (error) {
      console.error('Error voting on post:', error);
      
      // Revert optimistic updates on error
      setLocalScore(post.score || 0);
      setLocalUserVote(post.userVote || 0);
      
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
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
        // Remove bookmark
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
        // Add bookmark
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

  const handleDelete = async () => {
    if (!user) return;
    
    // Check if user is post owner or admin
    if (user.id !== post.user_id && !isAdmin) return;
    
    try {
      setIsDeleting(true);
      
      // Delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
        
      if (error) throw error;
      
      toast({
        title: "Post excluído",
        description: "A publicação foi excluída com sucesso.",
      });
      
      // Refresh the posts list
      onVoteChange();
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

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handlePinToggle = async () => {
    if (post.pinned) {
      unpinPost.mutate(post.id);
    } else {
      pinPost.mutate({ postId: post.id, pinDurationDays: 7 });
    }
  };

  // Modified to handle poll votes properly
  const handlePollVoteChange = () => {
    console.log("Poll vote changed, refreshing post data");
    onVoteChange(); // This will trigger a refetch of the post data
  };

  const isIssueDiscussion = post.post_flairs?.name === 'Discussão de Edição';
  const cardClasses = `rounded-lg border p-4 mb-6 ${
    post.pinned 
      ? 'bg-yellow-50/5 border-yellow-500/30' 
      : isIssueDiscussion 
        ? 'bg-purple-50/5 border-purple-500/30'
        : 'bg-gray-800/10 border-gray-700/30'
  }`;

  return (
    <div className={cardClasses}>
      {/* Pinned indicator */}
      {post.pinned && (
        <div className="flex items-center mb-3 text-yellow-500 text-sm">
          <Pin className="h-4 w-4 mr-1" />
          <span>Fixado por admin</span>
        </div>
      )}

      <div className="flex items-start space-x-4">
        {/* Post content */}
        <div className="flex-1 min-w-0">
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
            
            {/* Report button as just an icon */}
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-500"
              onClick={() => setShowReportDialog(true)}
            >
              <Flag className="h-4 w-4" />
              <span className="sr-only">Denunciar</span>
            </Button>
          </div>
          
          <h3 className="text-lg font-medium leading-tight mb-2">{post.title}</h3>
          
          {post.post_flairs && (
            <Badge 
              style={{ backgroundColor: post.post_flairs.color }}
              className="text-xs mb-3"
            >
              {post.post_flairs.name}
            </Badge>
          )}
          
          <PostContent post={post} onVoteChange={handlePollVoteChange} />

          {/* Issue discussion banner - positioned after content */}
          {isIssueDiscussion && post.issue_id && issueCoverUrl && (
            <div 
              className="mt-4 mb-4 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] group relative"
              onClick={() => navigate(`/article/${post.issue_id}`)}
            >
              <div 
                className="relative h-20 bg-cover bg-center flex items-center"
                style={{ 
                  backgroundImage: `url(${issueCoverUrl})`,
                }}
              >
                {/* Overlay for better text contrast */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                
                {/* Content */}
                <div className="relative flex-1 px-4 flex items-center justify-between z-10">
                  <span className="text-sm text-white font-medium group-hover:text-yellow-100 transition-colors drop-shadow-lg">
                    Esta discussão refere-se a uma edição publicada.
                  </span>
                  <ExternalLink className="h-4 w-4 text-white group-hover:text-yellow-200 transition-colors drop-shadow-lg" />
                </div>
                
                {/* Subtle border for contrast */}
                <div className="absolute inset-0 border border-white/10 rounded-lg"></div>
              </div>
            </div>
          )}
          
          <div className="flex mt-4 space-x-2 items-center">
            {/* Voting buttons side by side */}
            <div className="flex items-center space-x-3 mr-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleVote(1)}
                disabled={isVoting}
              >
                <ArrowUp className={`h-5 w-5 ${localUserVote === 1 ? 'text-red-500' : ''}`} />
                <span className="sr-only">Vote up</span>
              </Button>
              
              <span className="text-sm font-medium">{localScore}</span>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleVote(-1)}
                disabled={isVoting}
              >
                <ArrowDown className={`h-5 w-5 ${localUserVote === -1 ? 'text-blue-500' : ''}`} />
                <span className="sr-only">Vote down</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-400 hover:text-white ${showComments ? 'text-white' : ''}`}
              onClick={toggleComments}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Comentários
              {!showComments && commentCount > 0 && (
                <span className="ml-1 text-xs bg-gray-700/50 px-1.5 py-0.5 rounded-full">
                  {commentCount}
                </span>
              )}
            </Button>
            
            {/* Save button - bookmark */}
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

            {/* Pin/Unpin button - only for admins */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                className={`text-gray-400 ${post.pinned ? 'text-yellow-500 hover:text-yellow-600' : 'hover:text-white'}`}
                onClick={handlePinToggle}
                disabled={pinPost.isPending || unpinPost.isPending}
              >
                {post.pinned ? <PinOff className="h-4 w-4 mr-1" /> : <Pin className="h-4 w-4 mr-1" />}
                {post.pinned ? 'Desafixar' : 'Fixar'}
              </Button>
            )}

            {/* Delete button - moved to far right, only visible to post owner or admin */}
            {user && (user.id === post.user_id || isAdmin) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-red-500 ml-auto"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section - visible when showComments is true */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <CommentSection postId={post.id} />
        </div>
      )}

      {/* Delete confirmation dialog */}
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

      {/* Report dialog */}
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
    </div>
  );
};
