
import React from 'react';
import { Archive } from 'lucide-react';

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
          R<Archive className="h-4 w-4 mb-3 ml-1" />
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className={`logo-text ${sizeClasses[size]} ${fontWeight} ${textColor} flex items-center`}>
        Reviews<Archive className="h-6 w-6 mb-3 ml-1" />
      </h1>
    </div>
  );
};

export default Logo;
