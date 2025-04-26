
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ReviewStatus as ReviewStatusType } from '@/types/issue';

interface ReviewStatusBadgeProps {
  status: ReviewStatusType;
}

export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'in_review':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'approved':
        return 'bg-green-500 hover:bg-green-600';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
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

  return (
    <Badge className={getStatusStyles()}>
      {getStatusLabel()}
    </Badge>
  );
};
