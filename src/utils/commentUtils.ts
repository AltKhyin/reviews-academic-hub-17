
// Re-export all comment utility functions from the split modules
export * from '@/types/commentTypes';
export * from '@/utils/commentFetch';
export * from '@/utils/commentOrganize';
export * from '@/utils/commentOperations';
// Do not re-export from commentHelpers.ts since it would cause a conflict with getEntityIdField
