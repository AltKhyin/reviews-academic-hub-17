
import React from 'react';
import Logo from '@/components/common/Logo';
import AuthForm from '@/components/auth/AuthForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-white via-white to-gray-100 relative overflow-hidden">
      {/* Logo positioned more to the center-left */}
      <div className="flex-1 flex justify-center items-center pl-16">
        <div className="w-full max-w-[400px]">
          <Logo size="xlarge" showSubtitle />
        </div>
      </div>

      {/* Auth form moved to the right with proper spacing */}
      <div className="w-[500px] flex items-center justify-end pr-12">
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
