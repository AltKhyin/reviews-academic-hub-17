
// ABOUTME: Highlighted callout boxes for important information
// Supports different types: info, warning, success, error, note

import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { ReviewBlock, CalloutPayload } from '@/types/review';
import { cn } from '@/lib/utils';

interface CalloutBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as CalloutPayload;

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInteraction?.(block.id.toString(), 'viewed', {
              block_type: 'callout',
              callout_type: payload.type,
              has_title: !!payload.title,
              timestamp: Date.now()
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [block.id, onInteraction, payload.type, payload.title]);

  const getCalloutConfig = () => {
    switch (payload.type) {
      case 'info':
        return {
          icon: Info,
          className: 'border-blue-200 bg-blue-50 text-blue-900',
          iconColor: 'text-blue-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'border-yellow-200 bg-yellow-50 text-yellow-900',
          iconColor: 'text-yellow-600'
        };
      case 'success':
        return {
          icon: CheckCircle,
          className: 'border-green-200 bg-green-50 text-green-900',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: XCircle,
          className: 'border-red-200 bg-red-50 text-red-900',
          iconColor: 'text-red-600'
        };
      case 'note':
      default:
        return {
          icon: FileText,
          className: 'border-gray-200 bg-gray-50 text-gray-900',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getCalloutConfig();
  const IconComponent = config.icon;

  return (
    <Alert className={cn("callout-block mb-6", config.className)}>
      <IconComponent className={cn("h-4 w-4", config.iconColor)} />
      {payload.title && (
        <AlertTitle className="mb-2 font-semibold">
          {payload.title}
        </AlertTitle>
      )}
      <AlertDescription className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: payload.content }} />
      </AlertDescription>
    </Alert>
  );
};
