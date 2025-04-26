
import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left section with gradient */}
      <div className="flex-1 bg-white p-6 md:p-12 flex items-center">
        <div className="w-full max-w-[480px] mx-auto">
          <div className="mb-12 ml-0">
            <div className="text-left mb-16">
              <h1 className="text-5xl font-bold mb-2">
                Bem-vindo ao <span className="text-[#667EEA]">Reviews.</span>
              </h1>
              <p className="text-gray-600">
                - por Igor Eckert
              </p>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
      
      {/* Right section with image */}
      <div className="hidden md:block md:w-[45%]">
        <div className="h-full w-full relative">
          <img 
            src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80&w=2000"
            alt="Scientific research" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
