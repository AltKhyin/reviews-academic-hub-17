
import { Comment, CommentVote, EntityType } from "@/types/comment";
import { supabase } from "@/integrations/supabase/client";

// Returns the appropriate field name for database queries based on entity type
export const getEntityIdField = (entityType: EntityType): string => {
  return entityType === 'article' ? 'article_id' : 
         entityType === 'issue' ? 'issue_id' : 'post_id';
};

// Verify if the entity exists in the database
export const verifyEntityExists = async (entityId: string, entityType: EntityType): Promise<boolean> => {
  try {
    if (entityType === 'article') {
      const { data, error } = await supabase
        .from('articles')
        .select('id')
        .eq('id', entityId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } else if (entityType === 'issue') {
      const { data, error } = await supabase
        .from('issues')
        .select('id')
        .eq('id', entityId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } else if (entityType === 'post') {
      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .eq('id', entityId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying entity exists:', error);
    return false;
  }
};

// Fetch comments data for an entity
export const fetchCommentsData = async (entityId: string, entityType: EntityType) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // First, verify if the entity exists
    const entityExists = await verifyEntityExists(entityId, entityType);
    
    if (!entityExists) {
      console.error(`${entityType} with ID ${entityId} not found`);
      return { comments: [], userVotes: [] };
    }
    
    // Get the appropriate entity ID field
    const entityIdField = getEntityIdField(entityType);
    
    // Create the select query based on the entity type
    let selectQuery = `
      id, 
      content, 
      created_at, 
      updated_at, 
      user_id, 
      parent_id,
      score,
      profiles:user_id (id, full_name, avatar_url)
    `;
    
    // Add the appropriate entity ID field
    if (entityType === 'article') {
      selectQuery += `, article_id`;
    } else if (entityType === 'issue') {
      selectQuery += `, issue_id`;
    } else if (entityType === 'post') {
      selectQuery += `, post_id`;
    }
    
    // Fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(selectQuery)
      .eq(entityIdField, entityId)
      .order('created_at', { ascending: false });
      
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      throw commentsError;
    }
    
    // Fetch comment votes if user is logged in
    let userVotes: CommentVote[] = [];
    
    if (user) {
      const { data: votesData, error: votesError } = await supabase
        .from('comment_votes')
        .select('comment_id, value, user_id')
        .eq('user_id', user.id)
        .in('comment_id', commentsData.map((c: any) => c.id));
        
      if (votesError) {
        console.error('Error fetching votes:', votesError);
      } else if (votesData) {
        userVotes = votesData as CommentVote[];
      }
    }
    
    return { 
      comments: commentsData,
      userVotes
    };
  } catch (error) {
    console.error('Error in fetchCommentsData:', error);
    return { comments: [], userVotes: [] };
  }
};

// Organize comments into a hierarchical structure - fixing excessive recursion
export const organizeComments = (commentsData: { comments: any[], userVotes: CommentVote[] }): Comment[] => {
  if (!commentsData?.comments) return [];
  
  const { comments, userVotes } = commentsData;
  
  // Map of user votes by comment ID
  const userVotesMap: Record<string, number> = {};
  userVotes.forEach((vote: CommentVote) => {
    userVotesMap[vote.comment_id] = vote.value;
  });
  
  // Create map for quick lookup of comments by ID
  const commentMap: Record<string, Comment> = {};
  
  // First pass: Process comments to create all Comment objects without setting up the reply relationships
  comments.forEach((comment: any) => {
    commentMap[comment.id] = {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user_id: comment.user_id,
      parent_id: comment.parent_id,
      article_id: comment.article_id,
      issue_id: comment.issue_id,
      post_id: comment.post_id,
      score: comment.score,
      profiles: comment.profiles,
      userVote: (userVotesMap[comment.id] as (1 | -1 | 0)) || 0,
      replies: [] // Initialize with empty array
    };
  });
  
  // Second pass: Set up reply relationships
  const topLevelComments: Comment[] = [];
  
  Object.values(commentMap).forEach((comment) => {
    if (!comment.parent_id) {
      // This is a top-level comment
      topLevelComments.push(comment);
    } else if (commentMap[comment.parent_id]) {
      // This is a reply to another comment
      commentMap[comment.parent_id].replies!.push(comment);
    } else {
      // This is a reply but the parent was not found, treat as top-level
      console.warn(`Parent comment ${comment.parent_id} not found for comment ${comment.id}`);
      topLevelComments.push(comment);
    }
  });
  
  // Sort replies by created_at
  Object.values(commentMap).forEach((comment) => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
  });
  
  return topLevelComments;
};
