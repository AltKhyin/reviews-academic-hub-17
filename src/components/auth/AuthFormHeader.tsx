
import React from 'react';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthFormHeaderProps {
  mode: AuthMode;
}

const AuthFormHeader = ({ mode }: AuthFormHeaderProps) => {
  switch (mode) {
    case 'login':
      return (
        <div className="flex items-center space-x-2 text-black">
          <span className="h-1.5 w-1.5 rounded-full bg-black"></span>
          <h2 className="text-xl font-serif tracking-tight">Sign In</h2>
        </div>
      );
    case 'register':
      return (
        <>
          <div className="flex items-center space-x-2 text-black">
            <span className="h-1.5 w-1.5 rounded-full bg-black"></span>
            <h2 className="text-xl font-serif tracking-tight">Register</h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to get started
          </p>
        </>
      );
    case 'forgot':
      return (
        <>
          <div className="flex items-center space-x-2 text-black">
            <span className="h-1.5 w-1.5 rounded-full bg-black"></span>
            <h2 className="text-xl font-serif tracking-tight">Reset Password</h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            We'll send you instructions via email
          </p>
        </>
      );
    default:
      return null;
  }
};

export default AuthFormHeader;
