
import React from 'react';
import Logo from '@/components/common/Logo';
import AuthForm from '@/components/auth/AuthForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-white via-white to-gray-100 relative overflow-hidden">
      {/* Left side with logo - centered */}
      <div className="flex-1 flex justify-center items-center px-8">
        <div className="w-full max-w-[400px]">
          <Logo size="xlarge" showSubtitle />
        </div>
      </div>

      {/* Right side with auth form */}
      <div className="w-[500px] flex items-center justify-end pr-8">
        <div className="w-full max-w-[400px]">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
