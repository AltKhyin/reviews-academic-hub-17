
import { EntityType } from '@/types/commentTypes';

// Get the entity ID field name based on entity type
export const getEntityIdField = (entityType: EntityType): string => {
  return `${entityType}_id`;
};

// Additional helper functions can be added here as needed
