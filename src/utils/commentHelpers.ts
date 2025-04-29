
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

// Import these from other files to avoid duplication
import { appendUserVotesToComments } from './commentFetch';
import { organizeCommentsInTree } from './commentOrganize';
