
// ABOUTME: Enhanced callout block with improved styling and icons
// Provides visual highlights and alerts with better contrast

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Info, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { ReviewBlock } from '@/types/review';

interface CalloutBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
}

const calloutTypes = {
  info: {
    icon: Info,
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
    textColor: '#93c5fd',
    iconColor: '#3b82f6'
  },
  warning: {
    icon: AlertTriangle,
    backgroundColor: '#92400e',
    borderColor: '#f59e0b',
    textColor: '#fbbf24',
    iconColor: '#f59e0b'
  },
  error: {
    icon: AlertCircle,
    backgroundColor: '#991b1b',
    borderColor: '#ef4444',
    textColor: '#fca5a5',
    iconColor: '#ef4444'
  },
  success: {
    icon: CheckCircle,
    backgroundColor: '#065f46',
    borderColor: '#10b981',
    textColor: '#6ee7b7',
    iconColor: '#10b981'
  },
  tip: {
    icon: Lightbulb,
    backgroundColor: '#7c2d12',
    borderColor: '#ea580c',
    textColor: '#fdba74',
    iconColor: '#ea580c'
  }
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ 
  block, 
  readonly = false 
}) => {
  const payload = block.payload;
  const calloutType = calloutTypes[payload.type as keyof typeof calloutTypes] || calloutTypes.info;
  const IconComponent = calloutType.icon;

  return (
    <Card 
      className="callout-block border-l-4 shadow-md"
      style={{
        backgroundColor: calloutType.backgroundColor,
        borderLeftColor: calloutType.borderColor,
        borderColor: calloutType.borderColor
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <IconComponent 
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{ color: calloutType.iconColor }}
          />
          <div className="flex-1">
            {payload.title && (
              <h4 
                className="font-semibold text-sm mb-2"
                style={{ color: calloutType.textColor }}
              >
                {payload.title}
              </h4>
            )}
            <div 
              className="text-sm leading-relaxed"
              style={{ color: calloutType.textColor }}
              dangerouslySetInnerHTML={{ __html: payload.content || '' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
