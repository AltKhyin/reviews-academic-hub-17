
import { EntityType } from '@/types/commentTypes';

// Helper function to get the correct field name for entity ID
export const getEntityIdField = (entityType: EntityType): string => {
  switch (entityType) {
    case 'article':
      return 'article_id';
    case 'issue':
      return 'issue_id';
    case 'post':
      // Check if we're working with a post type but the database doesn't have post_id column
      return 'article_id'; // Temporarily use article_id for posts as a workaround
    default:
      return 'article_id';
  }
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
