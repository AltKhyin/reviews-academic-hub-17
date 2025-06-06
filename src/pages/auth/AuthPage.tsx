
// ABOUTME: Authentication page with consistent dark theme
// Uses app color system for proper visual identity

import React from 'react';
import Logo from '@/components/common/Logo';
import AuthForm from '@/components/auth/AuthForm';
import { CSS_VARIABLES } from '@/utils/colorSystem';

const AuthPage = () => {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: CSS_VARIABLES.PRIMARY_BG }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl px-6">
        <div className="flex-1 flex justify-center items-center">
          <div className="w-full max-w-[400px]">
            <Logo size="xlarge" showSubtitle={true} dark={false} />
          </div>
        </div>
        
        <div className="w-full max-w-[350px] mt-8 md:mt-0">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
