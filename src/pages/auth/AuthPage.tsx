
import React from 'react';
import Logo from '@/components/common/Logo';
import AuthForm from '@/components/auth/AuthForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-white via-white to-gray-100 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl px-6">
        <div className="flex-1 flex justify-center items-center">
          <div className="w-full max-w-[400px]">
            <Logo size="xlarge" showSubtitle dark={true} />
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
