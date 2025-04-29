
// Re-export all comment utility functions from the split modules
export * from '@/types/commentTypes';
export * from '@/utils/commentFetch';
export * from '@/utils/commentOrganize';
export * from '@/utils/commentOperations';
// Export from helpers but exclude getEntityIdField which is already exported from commentFetch
export { organizeComments } from '@/utils/commentHelpers';
