
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Components
import { DashboardLayout } from "./layouts/DashboardLayout";
import AuthPage from "./pages/auth/AuthPage";
import Dashboard from "./pages/dashboard/Dashboard";
import ArticleViewer from "./pages/dashboard/ArticleViewer";
import SearchPage from "./pages/dashboard/SearchPage";
import { Community } from "./pages/dashboard/Community";
import Profile from "./pages/dashboard/Profile";
import Edit from "./pages/dashboard/Edit";
import IssueEditor from "./pages/dashboard/IssueEditor";
import NotFound from "./pages/NotFound";
import PolicyPage from "./pages/PolicyPage";

// Create the query client outside the component function
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      meta: {
        errorMessage: "An error occurred while fetching data"
      }
    },
  },
});

const App = () => {
  // Move React hooks inside the component function
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes that don't require authentication */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/policy" element={<PolicyPage />} />
              
              {/* Protected routes that require authentication */}
              <Route path="/" element={<DashboardLayout />}>
                <Route path="homepage" element={<Dashboard />} />
                <Route path="article/:id" element={<ArticleViewer />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="community" element={<Community />} />
                <Route path="articles" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="edit" element={<Edit />} />
                <Route path="edit/issue/:id" element={<IssueEditor />} />
                <Route path="edit/issue/new" element={<IssueEditor />} />
                <Route index element={<Navigate to="/homepage" replace />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
