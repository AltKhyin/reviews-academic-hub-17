
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
  const textColor = dark ? 'text-[#212121]' : 'text-white';
  
  // Font weight map
  const fontWeight = 'font-extrabold';
  
  // Size map with adjusted sizes to make the logo feel more premium
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
        <h1 className={`logo-text ${sizeClasses[size]} ${fontWeight} ${textColor} flex items-center`}>
          R.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className={`logo-text ${sizeClasses[size]} ${fontWeight} ${textColor} flex items-center`}>
        Reviews.
      </h1>
    </div>
  );
};

export default Logo;
