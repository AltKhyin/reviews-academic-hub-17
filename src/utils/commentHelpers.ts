
// ABOUTME: Comment data processing and organization utilities
import { EntityType } from '@/types/commentTypes';

// Build comment data for database insertion
export const buildCommentData = (
  content: string,
  userId: string,
  entityType: EntityType,
  entityId: string,
  parentId?: string
) => {
  const baseComment = {
    content: content.trim(),
    user_id: userId,
    parent_id: parentId || null,
  };

  // Add entity-specific field
  switch (entityType) {
    case 'article':
      return { ...baseComment, article_id: entityId };
    case 'issue':
      return { ...baseComment, issue_id: entityId };
    case 'post':
      return { ...baseComment, post_id: entityId };
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
};

// Get the correct entity ID field name for queries
export const getEntityIdField = (entityType: EntityType): string => {
  switch (entityType) {
    case 'article':
      return 'article_id';
    case 'issue':
      return 'issue_id';
    case 'post':
      return 'post_id';
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
};

// Process comments data from database response
export const processCommentsData = (rawComments: any[], userVotes: any[] = []) => {
  if (!rawComments || !Array.isArray(rawComments)) return [];

  return rawComments.map(comment => {
    const userVote = userVotes.find(vote => vote.comment_id === comment.id);
    
    return {
      ...comment,
      userVote: userVote ? (userVote.value as 1 | 0 | -1) : 0,
      replies: comment.replies || []
    };
  });
};
