
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  setMode: (mode: 'login' | 'register' | 'forgot') => void;
}

const LoginForm = ({ setMode }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Attempting to sign in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful, session:", data.session);
      toast({
        title: "Success",
        description: "You've been logged in successfully",
      });
      
      navigate('/homepage');
    } catch (error: any) {
      console.error("Full login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white border-gray-300 focus:border-black focus:ring-0 text-black"
        placeholder="Email"
        required
      />

      <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-white border-gray-300 focus:border-black focus:ring-0 text-black"
        placeholder="Password"
        required
        minLength={6}
      />

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

      <Button 
        type="submit" 
        className="w-full bg-black hover:bg-gray-800 text-white"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait...
          </>
        ) : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
