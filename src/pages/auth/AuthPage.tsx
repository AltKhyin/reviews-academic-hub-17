
import React from 'react';
import Logo from '@/components/common/Logo';
import AuthForm from '@/components/auth/AuthForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-white via-white to-gray-100 relative overflow-hidden">
      {/* Left side with logo - add max-width to prevent logo from going too far left */}
      <div className="relative w-full flex flex-col justify-center items-start px-8 md:px-16 z-10 max-w-[800px]">
        <div className="w-full max-w-[500px]">
          <Logo size="xlarge" showSubtitle />
        </div>
      </div>

      {/* Right side with auth form */}
      <div className="relative w-full md:w-[500px] flex items-center justify-center px-8 md:px-12 z-10">
        <div className="w-full max-w-[400px] py-12">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
