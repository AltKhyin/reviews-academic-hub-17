
import { supabase } from '@/integrations/supabase/client';
import { Comment, EntityType } from '@/types/commentTypes';

/**
 * Fetches comments and user votes for a specific entity
 */
export async function fetchCommentsData(entityId: string, entityType: EntityType = 'article') {
  console.log(`Fetching comments for ${entityType} with ID: ${entityId}`);
  
  if (!entityId) {
    console.error('No entity ID provided for comment fetch');
    return { comments: [], userVotes: [] };
  }

  // Determine which field to query on based on entity type
  const idField = entityType === 'article' 
    ? 'article_id' 
    : entityType === 'post' 
      ? 'post_id' 
      : 'issue_id';
  
  try {
    // Check if the entity exists first
    const entityTable = entityType === 'article' ? 'articles' : entityType === 'post' ? 'posts' : 'issues';
    const { data: entityExists, error: entityCheckError } = await supabase
      .from(entityTable)
      .select('id')
      .eq('id', entityId)
      .maybeSingle();

    if (entityCheckError) {
      console.error(`Error checking if ${entityType} exists:`, entityCheckError);
      throw entityCheckError;
    }

    if (!entityExists) {
      console.warn(`${entityType} with ID ${entityId} does not exist`);
      return { comments: [], userVotes: [] };
    }

    // Fetch comments for this entity
    const { data: comments = [], error: commentError } = await supabase
      .from('comments')
      .select('*')
      .eq(idField, entityId)
      .order('created_at', { ascending: false });

    if (commentError) {
      console.error('Error fetching comments:', commentError);
      throw commentError;
    }

    // Get the current user's ID from auth context
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // If user is authenticated, fetch their votes
    let userVotes: any[] = [];
    if (userId) {
      const { data: votes = [], error: votesError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('user_id', userId);

      if (votesError) {
        console.error('Error fetching comment votes:', votesError);
      } else {
        userVotes = votes;
      }
    }

    return { comments, userVotes };
  } catch (error) {
    console.error('Error in fetchCommentsData:', error);
    return { comments: [], userVotes: [] };
  }
}
