
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type AuthMode = 'login' | 'register' | 'forgot';

const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        navigate('/homepage');
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created successfully",
          description: "Please sign in to continue",
        });
        setMode('login');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        
        if (error) throw error;
        
        toast({
          title: "Email sent",
          description: "Check your inbox for password reset instructions",
        });
        setMode('login');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
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
    }
  };

  return (
    <div className="mb-8 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-[350px]">
      {renderHeader()}
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {mode === 'register' && (
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white border-gray-300 focus:border-black focus:ring-0 text-black"
            placeholder="Full name"
            required={mode === 'register'}
          />
        )}
        
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white border-gray-300 focus:border-black focus:ring-0 text-black"
          placeholder="Email"
          required
        />

        {mode !== 'forgot' && (
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white border-gray-300 focus:border-black focus:ring-0 text-black"
            placeholder="Password"
            required={mode !== 'forgot'}
            minLength={6}
          />
        )}

        {mode === 'login' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-black data-[state=checked]:bg-black"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-700 select-none"
              >
                Remember me
              </label>
            </div>
            
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-sm text-gray-700 hover:text-black"
            >
              Forgot?
            </button>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-black hover:bg-gray-800 text-white"
          disabled={loading}
        >
          {loading ? 'Please wait...' : 
            mode === 'login' ? 'Sign In' : 
            mode === 'register' ? 'Create Account' : 
            'Send Instructions'}
        </Button>

        {mode !== 'forgot' && (
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">
                or continue with
              </span>
            </div>

            <div className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full bg-white hover:bg-gray-50 border-gray-300 text-gray-700 flex items-center justify-center gap-2"
                onClick={() => supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/homepage`
                  }
                })}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <p className="text-gray-700">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-black font-medium hover:underline"
              >
                Register
              </button>
            </p>
          ) : mode === 'register' ? (
            <p className="text-gray-700">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-black font-medium hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-gray-700">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-black font-medium hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
