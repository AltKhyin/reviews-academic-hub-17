
import React from 'react';
import Logo from '@/components/common/Logo';
import AuthForm from '@/components/auth/AuthForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-white via-white to-gray-100 relative overflow-hidden">
      {/* Logo moved more to the left */}
      <div className="flex-1 flex justify-start items-center pl-8">
        <div className="w-full max-w-[400px]">
          <Logo size="xlarge" showSubtitle />
        </div>
      </div>

      {/* Auth form on the right with proper spacing */}
      <div className="w-[500px] flex items-center justify-end pr-12">
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
