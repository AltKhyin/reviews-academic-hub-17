import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PostData } from '@/types/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PostContent } from '@/components/community/PostContent';
import { PostVoting } from '@/components/community/post/PostVoting';
import { PostActions } from '@/components/community/post/PostActions';
import { IssueDiscussionBanner } from '@/components/community/post/IssueDiscussionBanner';
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
  onVoteChange: () => void;
}

export const Post: React.FC<PostProps> = ({ post, onVoteChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const formatPostDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

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

  const handlePollVoteChange = () => {
    console.log("Poll vote changed, refreshing post data");
    onVoteChange();
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
      {post.pinned && (
        <div className="flex items-center mb-3 text-yellow-500 text-sm">
          <Pin className="h-4 w-4 mr-1" />
          <span>Fixado por admin</span>
        </div>
      )}

      <div className="flex items-start space-x-4">
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

          {isIssueDiscussion && post.issue_id && (
            <IssueDiscussionBanner issueId={post.issue_id} />
          )}
          
          <div className="flex items-center space-x-1">
            <PostVoting
              postId={post.id}
              initialScore={post.score || 0}
              initialUserVote={post.userVote || 0}
              onVoteChange={onVoteChange}
            />
            
            <PostActions
              postId={post.id}
              userId={post.user_id}
              isPinned={post.pinned}
              showComments={showComments}
              commentCount={commentCount}
              onToggleComments={toggleComments}
              onVoteChange={onVoteChange}
              onReport={() => setShowReportDialog(true)}
              onDelete={() => setShowDeleteDialog(true)}
            />
          </div>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <CommentSection postId={post.id} />
        </div>
      )}

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
