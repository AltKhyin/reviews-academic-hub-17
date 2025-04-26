
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ResetPasswordFormProps {
  setMode: (mode: 'login' | 'register' | 'forgot') => void;
}

const ResetPasswordForm = ({ setMode }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email sent",
        description: "Check your inbox for password reset instructions",
      });
      setMode('login');
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

      <Button 
        type="submit" 
        className="w-full bg-black hover:bg-gray-800 text-white"
        disabled={loading}
      >
        {loading ? 'Please wait...' : 'Send Instructions'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
