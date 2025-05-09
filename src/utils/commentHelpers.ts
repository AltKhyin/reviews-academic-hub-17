
import { EntityType } from '@/types/commentTypes';

// Helper function to get the correct field name for entity ID
export const getEntityIdField = (entityType: EntityType): string => {
  switch (entityType) {
    case 'article':
      return 'article_id';
    case 'issue':
      return 'issue_id';
    case 'post':
      // Use article_id for posts since the comments table doesn't have post_id column yet
      // The SQL migration has added the post_id column, but we'll continue using article_id 
      // for backward compatibility with existing comments
      return 'article_id';
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
