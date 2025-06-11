// ABOUTME: Main application component with optimized route-based code splitting
import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/ui/PageLoader";

// Keep critical routes static for immediate loading
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import AuthPage from "@/pages/auth/AuthPage";
import Dashboard from "@/pages/dashboard/Dashboard";

// Lazy load heavy/admin routes for better performance
const ArticleViewer = lazy(() => import("@/pages/dashboard/ArticleViewer"));
const ArchivePage = lazy(() => import("@/pages/dashboard/ArchivePage"));
const SearchPage = lazy(() => import("@/pages/dashboard/SearchPage"));
const Community = lazy(() => import("@/pages/dashboard/Community"));
const Profile = lazy(() => import("@/pages/dashboard/Profile"));
const Edit = lazy(() => import("@/pages/dashboard/Edit"));
const IssueEditor = lazy(() => import("@/pages/dashboard/IssueEditor"));

// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/homepage" replace />} />
                <Route path="homepage" element={<Dashboard />} />
                <Route 
                  path="article/:id" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ArticleViewer />
                    </Suspense>
                  } 
                />
                <Route 
                  path="acervo" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ArchivePage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="search" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SearchPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="community" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Community />
                    </Suspense>
                  } 
                />
                <Route 
                  path="profile" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Profile />
                    </Suspense>
                  } 
                />
                <Route 
                  path="edit" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Edit />
                    </Suspense>
                  } 
                />
                <Route 
                  path="edit/issue/:id" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <IssueEditor />
                    </Suspense>
                  } 
                />
              </Route>
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
