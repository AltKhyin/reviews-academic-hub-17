
// ABOUTME: Updated sidebar data hook to use optimized version with reduced polling
import { useOptimizedSidebarData } from './useOptimizedSidebarData';

// Maintain backward compatibility
export const useSidebarData = useOptimizedSidebarData;

