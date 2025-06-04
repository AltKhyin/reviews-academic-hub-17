
// ABOUTME: Warning/info admonition component for disclaimers and important notices
// Features customizable types, icons, and styling for editorial notices

import React from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

type AdmonitionType = 'warning' | 'info' | 'error' | 'success';

interface InlineAdmonitionProps {
  type: AdmonitionType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const admonitionConfig = {
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-yellow-500',
    bgColor: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-600 dark:text-yellow-400'
  },
  info: {
    icon: Info,
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-600 dark:text-blue-400'
  },
  error: {
    icon: AlertCircle,
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-500/10',
    iconColor: 'text-red-500',
    titleColor: 'text-red-600 dark:text-red-400'
  },
  success: {
    icon: CheckCircle,
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-500',
    titleColor: 'text-green-600 dark:text-green-400'
  }
};

export const InlineAdmonition: React.FC<InlineAdmonitionProps> = ({ 
  type, 
  title, 
  children, 
  className = '' 
}) => {
  const config = admonitionConfig[type];
  const Icon = config.icon;

  return (
    <aside 
      className={`
        border-l-4 p-4 rounded-r-lg
        ${config.borderColor}
        ${config.bgColor}
        ${className}
      `}
      role="complementary"
      aria-label={`${type} notice`}
    >
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        
        <div className="flex-1 space-y-2">
          {title && (
            <h4 className={`font-semibold ${config.titleColor}`}>
              {title}
            </h4>
          )}
          
          <div className="text-sm text-foreground/90 prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default InlineAdmonition;
