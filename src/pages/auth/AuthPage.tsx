
import React from 'react';
import Logo from '@/components/common/Logo';
import AuthForm from '@/components/auth/AuthForm';
import AnimatedBackground from '@/components/auth/AnimatedBackground';

const AuthPage = () => {
  return (
    <div className="min-h-screen w-full flex bg-black relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative w-full flex flex-col justify-center items-start px-8 md:px-16 z-10">
        <div className="w-full max-w-[500px]">
          <Logo size="xlarge" showSubtitle />
        </div>
      </div>

      <div className="relative w-full md:w-[500px] flex items-center justify-center px-8 md:px-12 z-10">
        <div className="w-full max-w-[400px] py-12">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
