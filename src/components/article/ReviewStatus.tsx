
// ABOUTME: Review status badge with consistent color system
// Uses app colors for status indicators

import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ReviewStatus as ReviewStatusType } from '@/types/issue';
import { CSS_VARIABLES, APP_COLORS } from '@/utils/colorSystem';

interface ReviewStatusBadgeProps {
  status: ReviewStatusType;
}

export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return { backgroundColor: CSS_VARIABLES.TERTIARY_BG, color: CSS_VARIABLES.TEXT_SECONDARY };
      case 'in_review':
        return { backgroundColor: APP_COLORS.WARNING, color: CSS_VARIABLES.TEXT_PRIMARY };
      case 'approved':
        return { backgroundColor: APP_COLORS.SUCCESS, color: CSS_VARIABLES.TEXT_PRIMARY };
      case 'rejected':
        return { backgroundColor: APP_COLORS.ERROR, color: CSS_VARIABLES.TEXT_PRIMARY };
      default:
        return { backgroundColor: CSS_VARIABLES.TERTIARY_BG, color: CSS_VARIABLES.TEXT_SECONDARY };
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'in_review':
        return 'In Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const styles = getStatusStyles();

  return (
    <Badge style={styles}>
      {getStatusLabel()}
    </Badge>
  );
};
