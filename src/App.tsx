
// ABOUTME: Updated App.tsx with query optimization integration and performance monitoring
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryOptimizationProvider } from "./components/optimization/QueryOptimizationProvider";

// Components
import { DashboardLayout } from "./layouts/DashboardLayout";
import AuthPage from "./pages/auth/AuthPage";
import Dashboard from "./pages/dashboard/Dashboard";
import { HomePage } from "./pages/home/HomePage";
import ArticleViewer from "./pages/dashboard/ArticleViewer";
import SearchPage from "./pages/dashboard/SearchPage";
import ArchivePage from "./pages/dashboard/ArchivePage";
import Community from "./pages/dashboard/Community";
import Profile from "./pages/dashboard/Profile";
import Edit from "./pages/dashboard/Edit";
import IssueEditor from "./pages/dashboard/IssueEditor";
import NotFound from "./pages/NotFound";
import PolicyPage from "./pages/PolicyPage";

const App = () => {
  // Enable dark mode by default and optimize for native editor experience
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Add editor-optimized class for better native editing experience
    const currentPath = window.location.pathname;
    if (currentPath.includes('/edit/issue/')) {
      document.body.classList.add('editor-optimized');
    }
    
    // Clean up on route changes
    return () => {
      document.body.classList.remove('editor-optimized');
    };
  }, []);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <TooltipProvider>
      <AuthProvider>
        <QueryOptimizationProvider enableDebugLogging={isDevelopment}>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes that don't require authentication */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            
            {/* Protected routes that require authentication */}
            <Route path="/" element={<DashboardLayout />}>
              <Route path="home" element={<HomePage />} />
              <Route path="homepage" element={<Dashboard />} />
              <Route path="article/:id" element={<ArticleViewer />} />
              <Route path="acervo" element={<ArchivePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="community" element={<Community />} />
              <Route path="articles" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="edit" element={<Edit />} />
              <Route path="edit/issue/:id" element={<IssueEditor />} />
              <Route path="edit/issue/new" element={<IssueEditor />} />
              <Route index element={<Navigate to="/home" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryOptimizationProvider>
      </AuthProvider>
    </TooltipProvider>
  );
};

export default App;
