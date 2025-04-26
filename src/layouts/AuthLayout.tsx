
import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left side with form */}
      <div className="w-full md:w-1/2 flex items-center justify-center auth-gradient p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <Logo />
          </div>
          <Outlet />
        </div>
      </div>
      
      {/* Right side with image */}
      <div className="hidden md:block md:w-1/2 bg-[#121212]">
        <div className="h-full w-full flex items-center justify-center">
          <div className="relative w-full h-full opacity-70">
            <img 
              src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80&w=1000" 
              alt="Scientific research" 
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
