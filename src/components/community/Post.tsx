
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PostData } from '@/types/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, MessageSquare, Trash, AlertTriangle, BookmarkPlus, Flag } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';

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
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

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

    // Auto-upvote your own post if you're the author
    const autoUpvoteOwnPost = async () => {
      if (user.id === post.user_id) {
        // Check if user already voted
        const { data: existingVote } = await supabase
          .from('post_votes')
          .select('*')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        // If user hasn't voted on their post yet, auto-upvote
        if (!existingVote) {
          try {
            await supabase
              .from('post_votes')
              .insert({ post_id: post.id, user_id: user.id, value: 1 });
            
            // Refresh the post to get updated score
            onVoteChange();
          } catch (error) {
            console.error('Error auto-upvoting post:', error);
          }
        }
      }
    };
    
    autoUpvoteOwnPost();
  }, [user, post.id, post.user_id, onVoteChange]);

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };

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
      const { data, error } = await supabase
        .from('post_votes')
        .select('value')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // User already voted, need to update or delete
        if (data.value === value) {
          // Remove vote if clicking the same button
          await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', post.id)
            .eq('user_id', user.id);
        } else {
          // Update vote
          await supabase
            .from('post_votes')
            .update({ value })
            .eq('post_id', post.id)
            .eq('user_id', user.id);
        }
      } else {
        // New vote
        await supabase
          .from('post_votes')
          .insert({ post_id: post.id, user_id: user.id, value });
      }

      onVoteChange();
    } catch (error) {
      console.error('Error voting on post:', error);
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

  const handleCommentSubmit = async () => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para comentar em publicações.",
        variant: "destructive",
      });
      return;
    }

    if (!commentContent.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Por favor, escreva algo para comentar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCommentSubmitting(true);
      
      // Create comment in database
      const { error } = await supabase
        .from('comments')
        .insert({
          content: commentContent,
          user_id: user.id,
          post_id: post.id
        });
        
      if (error) throw error;
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso.",
      });
      
      setCommentContent('');
      setShowCommentDialog(false);
      
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Erro ao comentar",
        description: "Não foi possível publicar seu comentário.",
        variant: "destructive",
      });
    } finally {
      setIsCommentSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gray-800/10 rounded-lg border border-gray-700/30 p-4">
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
                {formatDate(post.created_at)}
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
          
          <PostContent post={post} onVoteChange={onVoteChange} />
          
          <div className="flex mt-4 space-x-2 items-center">
            {/* Voting buttons side by side */}
            <div className="flex items-center space-x-2 mr-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleVote(1)}
                disabled={isVoting}
              >
                <ArrowUp className={`h-5 w-5 ${post.userVote === 1 ? 'text-red-500' : ''}`} />
                <span className="sr-only">Vote up</span>
              </Button>
              
              <span className="text-sm font-medium">{post.score}</span>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleVote(-1)}
                disabled={isVoting}
              >
                <ArrowDown className={`h-5 w-5 ${post.userVote === -1 ? 'text-blue-500' : ''}`} />
                <span className="sr-only">Vote down</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white"
              onClick={() => setShowCommentDialog(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Comentários
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

      {/* Comment dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar comentário</DialogTitle>
            <DialogDescription>
              Escreva seu comentário sobre esta publicação
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="Escreva seu comentário..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCommentSubmit}
              disabled={isCommentSubmitting || !commentContent.trim()}
            >
              {isCommentSubmitting ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
