
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

import DashboardLayout from "./layouts/DashboardLayout";
import AuthPage from "./pages/auth/AuthPage";

import Dashboard from "./pages/dashboard/Dashboard";
import ArticleViewer from "./pages/dashboard/ArticleViewer";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Setting dark mode as default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // For development, we're temporarily skipping auth checks
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setLoading(false);
      }
    );

    // Check current session on load
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#121212] text-white">Carregando...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Route - temporarily not enforcing auth redirects for development */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Members Area Routes - temporarily not enforcing auth redirects for development */}
            <Route path="/" element={<DashboardLayout />}>
              <Route path="area-de-membros" element={<Dashboard />} />
              <Route path="article/:id" element={<ArticleViewer />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route index element={<Navigate to="/area-de-membros" replace />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
