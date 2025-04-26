
import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0 w-[200%] h-[200%] bg-cover bg-center animate-subtle-pan"
        style={{
          backgroundImage: `url('/background.jpg')`,
          animation: 'subtle-pan 25s linear infinite',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
