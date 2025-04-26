
import React from 'react';

interface LogoProps {
  dark?: boolean;
}

const Logo: React.FC<LogoProps> = ({ dark = false }) => {
  const textColor = dark ? 'text-white' : 'text-[#212121]';
  
  return (
    <div className="flex flex-col">
      <h1 className={`logo-text text-3xl ${textColor}`}>
        Reviews.
      </h1>
      <p className={`subtitle-text mt-1 ${textColor}`}>
        - por Igor Eckert
      </p>
    </div>
  );
};

export default Logo;
