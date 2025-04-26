
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Dashboard from "./pages/dashboard/Dashboard";
import ArticleViewer from "./pages/dashboard/ArticleViewer";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Function to check if user is authenticated
// This is a placeholder - will be replaced with actual Supabase auth check
const isAuthenticated = () => {
  const authToken = localStorage.getItem("auth_token");
  return !!authToken;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return children;
  }
  return <Navigate to="/dashboard" replace />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (isAuthenticated()) {
    return children;
  }
  return <Navigate to="/auth/login" replace />;
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

            {/* Members Area Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="area-de-membros" element={<Dashboard />} />
              <Route path="article/:id" element={<ArticleViewer />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route index element={<Navigate to="area-de-membros" replace />} />
            </Route>

            {/* Redirect root to members area or login based on auth state */}
            <Route path="/" element={
              isAuthenticated() ? 
                <Navigate to="/area-de-membros" replace /> : 
                <Navigate to="/auth/login" replace />
            } />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
