
import { EntityType } from '@/types/commentTypes';
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
