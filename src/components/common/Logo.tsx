
import React from 'react';

interface LogoProps {
  dark?: boolean;
  showSubtitle?: boolean;
  collapsed?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

const Logo = ({ 
  dark = false, 
  showSubtitle = false, 
  collapsed = false,
  size = 'medium'
}: LogoProps) => {
  const textColor = dark ? 'text-white' : 'text-[#212121]';
  
  // Font weight map
  const fontWeight = 'font-bold';
  
  // Size map
  const sizeClasses = {
    small: collapsed ? 'text-lg' : 'text-2xl',
    medium: collapsed ? 'text-xl' : 'text-3xl',
    large: collapsed ? 'text-2xl' : 'text-4xl',
    xlarge: 'text-7xl'
  };
  
  if (collapsed) {
    return (
      <div className="flex justify-center">
        <h1 className={`logo-text ${sizeClasses[size]} font-serif ${fontWeight} ${textColor}`}>
          R.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className={`logo-text ${sizeClasses[size]} font-serif ${fontWeight} ${textColor}`}>
        Reviews.
      </h1>
      {showSubtitle && (
        <p className={`subtitle-text mt-1 ${textColor} opacity-80 text-sm`}>
          - por Igor Eckert
        </p>
      )}
    </div>
  );
};

export default Logo;
