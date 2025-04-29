
import { supabase } from '@/integrations/supabase/client';
import { BaseComment, CommentQueryResponse, CommentVote, EntityType } from '@/types/commentTypes';

// Helper function to determine the entity ID field based on entity type
export const getEntityIdField = (entityType: EntityType): string => {
  switch (entityType) {
    case 'article':
      return 'article_id';
    case 'issue':
      return 'issue_id';
    case 'post':
      return 'post_id';
    default:
      return 'article_id';
  }
};

// Function to fetch comments data including user votes
export const fetchCommentsData = async (entityId: string, entityType: EntityType): Promise<CommentQueryResponse> => {
  const entityIdField = getEntityIdField(entityType);
  
  // Get the current user for vote data
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch comments with profile information
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq(entityIdField, entityId)
    .order('created_at');
    
  if (commentsError) throw commentsError;
  
  // If user is logged in, fetch their votes on these comments
  let userVotes: CommentVote[] = [];
  if (user) {
    const { data: votes, error: votesError } = await supabase
      .from('comment_votes')
      .select('*')
      .eq('user_id', user.id)
      .in('comment_id', comments.map(c => c.id));
      
    if (!votesError && votes) {
      userVotes = votes
        .filter(vote => vote.value === 1 || vote.value === -1)
        .map(vote => ({
          user_id: vote.user_id,
          comment_id: vote.comment_id,
          value: vote.value as 1 | -1
        }));
    }
  }
  
  return { comments: comments as BaseComment[], userVotes };
};
