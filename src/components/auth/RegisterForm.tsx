
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface RegisterFormProps {
  setMode: (mode: 'login' | 'register' | 'forgot') => void;
}

const RegisterForm = ({ setMode }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Fix: Ensure we're passing the full_name as metadata correctly
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created successfully",
        description: "Please check your email for verification link, then sign in to continue",
      });
      setMode('login');
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
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
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-white border-gray-300 focus:border-black focus:ring-0 text-black"
        placeholder="Full name"
        required
      />
      
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

      <Button 
        type="submit" 
        className="w-full bg-black hover:bg-gray-800 text-white"
        disabled={loading}
      >
        {loading ? 'Please wait...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegisterForm;
