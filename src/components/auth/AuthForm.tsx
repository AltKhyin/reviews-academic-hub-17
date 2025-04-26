
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import AuthFormHeader from '@/components/auth/AuthFormHeader';
import SocialLogin from '@/components/auth/SocialLogin';
import AuthFormFooter from '@/components/auth/AuthFormFooter';

type AuthMode = 'login' | 'register' | 'forgot';

const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  const renderForm = () => {
    switch (mode) {
      case 'login':
        return <LoginForm setMode={setMode} />;
      case 'register':
        return <RegisterForm setMode={setMode} />;
      case 'forgot':
        return <ResetPasswordForm setMode={setMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-8 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-[350px]">
      <AuthFormHeader mode={mode} />
      
      {renderForm()}

      {mode !== 'forgot' && (
        <SocialLogin />
      )}

      <AuthFormFooter mode={mode} setMode={setMode} />
    </div>
  );
};

export default AuthForm;
