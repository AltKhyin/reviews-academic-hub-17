
// Re-export all comment utility functions from the split modules
export * from '@/types/commentTypes';
export { fetchCommentsData, appendUserVotesToComments } from '@/utils/commentFetch';
export { organizeCommentsInTree } from '@/utils/commentOrganize';
export { organizeComments } from '@/utils/commentHelpers';
