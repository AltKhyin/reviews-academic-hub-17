
import { Comment, EntityType, BaseComment } from '@/types/commentTypes';
import { appendUserVotesToComments } from './commentFetch';
import { organizeCommentsInTree } from './commentOrganize';

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
export function buildCommentData(
  content: string,
  userId: string,
  entityType: EntityType,
  entityId: string,
  parentId?: string
) {
  const data: any = {
    content,
    user_id: userId,
    score: 0, // Initialize with 0 score - votes are handled separately
  };

  if (entityType === 'article') data.article_id = entityId;
  else if (entityType === 'post') data.post_id = entityId;
  else if (entityType === 'issue') data.issue_id = entityId;
  else throw new Error('Invalid entityType');

  if (parentId) data.parent_id = parentId;

  return data;
}

// Helper function to process comments data
export const processCommentsData = (commentsData: BaseComment[], userVotes: any[] = []): Comment[] => {
  if (!commentsData || commentsData.length === 0) return [];
  
  // First append user votes to comments
  const commentsWithVotes = appendUserVotesToComments(
    commentsData,
    userVotes || []
  );
  
  // Then organize into tree structure
  return organizeCommentsInTree(commentsWithVotes);
};
