
import React from 'react';

interface LogoProps {
  dark?: boolean;
  showSubtitle?: boolean;
  collapsed?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export const Logo = ({ 
  dark = false, 
  showSubtitle = false, 
  collapsed = false,
  size = 'medium'
}: LogoProps) => {
  const textColor = dark ? 'text-[#212121]' : 'text-white';
  
  // Font weight map
  const fontWeight = 'font-extrabold';
  
  // Size map
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-5xl',
    xlarge: 'text-8xl'
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
