
import React from 'react';

interface LogoProps {
  dark?: boolean;
  showSubtitle?: boolean;
  collapsed?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | '2xlarge';
}

export const Logo = ({ 
  dark = false, 
  showSubtitle = false, 
  collapsed = false,
  size = 'medium'
}: LogoProps) => {
  const textColor = dark ? 'text-black' : 'text-white';
  
  // Size map with proper serif typography
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-5xl',
    xlarge: 'text-8xl',
    '2xlarge': 'text-9xl'
  };
  
  if (collapsed) {
    return (
      <div className="flex justify-center">
        <h1 className={`font-serif font-medium tracking-tight ${sizeClasses[size]} ${textColor} flex items-center`}>
          R.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className={`font-serif font-medium tracking-tight ${sizeClasses[size]} ${textColor} flex items-center`}>
        Reviews.
      </h1>
      {showSubtitle && (
        <p className={`text-sm mt-1 ${textColor} opacity-80`}>
          - por Igor Eckert
        </p>
      )}
    </div>
  );
};

export default Logo;
