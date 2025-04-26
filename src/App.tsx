
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AuthCallback from "./pages/auth/AuthCallback";

import Dashboard from "./pages/dashboard/Dashboard";
import ArticleViewer from "./pages/dashboard/ArticleViewer";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Function to check if user is authenticated
const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Auth Route Component
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = () => <Navigate to="/area-de-membros" replace />;

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await isAuthenticated();
      setAuthenticated(authed);
      setLoading(false);
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async () => {
        const authed = await isAuthenticated();
        setAuthenticated(authed);
      }
    );
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  
  return authenticated ? navigate() : children;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = () => <Navigate to="/auth/login" replace />;

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await isAuthenticated();
      setAuthenticated(authed);
      setLoading(false);
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async () => {
        const authed = await isAuthenticated();
        setAuthenticated(authed);
      }
    );
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  
  return authenticated ? children : navigate();
};

const App = () => {
  // Set dark mode as default theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={
              <AuthRoute>
                <AuthLayout />
              </AuthRoute>
            }>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route index element={<Navigate to="login" replace />} />
            </Route>

            {/* Auth Callback Route */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Members Area Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="area-de-membros" element={<Dashboard />} />
              <Route path="article/:id" element={<ArticleViewer />} />
              <Route path="articles" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route index element={<Navigate to="area-de-membros" replace />} />
            </Route>

            {/* Redirect root to members area or login based on auth state */}
            <Route path="/" element={<Navigate to="/area-de-membros" replace />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
