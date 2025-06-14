
// ABOUTME: Utilities for handling block spacing.
import { SpacingConfig } from '@/types/review'; // Changed from BlockSpacing

export const getSpacingStyles = (spacing: SpacingConfig | undefined) => {
  if (!spacing) return {};
  // A real implementation would go here
  return {
    marginTop: spacing.margin?.top,
    marginBottom: spacing.margin?.bottom,
    paddingTop: spacing.padding?.top,
    paddingBottom: spacing.padding?.bottom,
  };
};
