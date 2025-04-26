
import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="absolute right-0 top-0 h-full w-1/3 md:w-1/5 overflow-hidden">
      <div 
        className="absolute inset-0 w-[200%] h-[200%] bg-cover bg-center"
        style={{
          backgroundImage: `url('/lovable-uploads/dcb845c7-0597-4150-86fc-71dc09144f58.png')`,
          animation: 'subtle-pan 25s linear infinite',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
