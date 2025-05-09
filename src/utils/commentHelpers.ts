
import { EntityType } from '@/types/commentTypes';

// Helper function to get the correct field name for entity ID
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

// Important: Create a function to build the comment data object correctly
export const buildCommentData = (content: string, userId: string, entityType: EntityType, entityId: string, parentId?: string) => {
  const commentData: any = {
    content,
    user_id: userId,
    score: 0
  };
  
  // Add parent_id if it exists
  if (parentId) {
    commentData.parent_id = parentId;
  }
  
  // Add ONLY the correct entity ID field based on the entity type
  // This prevents foreign key constraint violations
  switch (entityType) {
    case 'article':
      commentData.article_id = entityId;
      break;
    case 'issue':
      commentData.issue_id = entityId;
      break;
    case 'post':
      commentData.post_id = entityId;
      break;
  }
  
  return commentData;
};

// Import these from other files to avoid duplication
import { appendUserVotesToComments } from './commentFetch';
import { organizeCommentsInTree } from './commentOrganize';

// Helper function to organize comments and append user votes
export const organizeComments = (commentsData: { 
  comments: any[], 
  userVotes: any[] 
}) => {
  if (!commentsData || !commentsData.comments) return [];
  
  // First append user votes to comments
  const commentsWithVotes = appendUserVotesToComments(
    commentsData.comments,
    commentsData.userVotes || []
  );
  
  // Then organize into tree structure
  return organizeCommentsInTree(commentsWithVotes);
};
