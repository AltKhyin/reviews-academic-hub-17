
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route path="/" element={<DashboardLayout />}>
              <Route path="homepage" element={<Dashboard />} />
              <Route path="article/:id" element={<ArticleViewer />} />
              <Route path="articles" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route index element={<Navigate to="/homepage" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
