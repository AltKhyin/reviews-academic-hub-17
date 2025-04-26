
import React from 'react';

interface LogoProps {
  dark?: boolean;
  showSubtitle?: boolean;
}

const Logo = ({ dark = false, showSubtitle = false }: LogoProps) => {
  const textColor = dark ? 'text-white' : 'text-[#212121]';
  
  return (
    <div className="flex flex-col">
      <h1 className={`logo-text text-3xl font-serif ${textColor}`}>
        Reviews.
      </h1>
      {showSubtitle && (
        <p className={`subtitle-text mt-1 ${textColor} opacity-80`}>
          - por Igor Eckert
        </p>
      )}
    </div>
  );
};

export default Logo;
