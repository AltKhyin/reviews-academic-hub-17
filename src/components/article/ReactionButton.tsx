
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ReactionButtonProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  activeClassName?: string;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  disabled,
  activeClassName = '' 
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={isActive ? activeClassName : ''}
      disabled={disabled}
    >
      <Icon className="mr-1" size={16} />
      {label}
    </Button>
  );
};
