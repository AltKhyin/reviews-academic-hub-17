import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";

import DashboardLayout from "./layouts/DashboardLayout";
import AuthPage from "./pages/auth/AuthPage";
import Dashboard from "./pages/dashboard/Dashboard";
import ArticleViewer from "./pages/dashboard/ArticleViewer";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";
import Edit from "./pages/dashboard/Edit";
import IssueEditor from "./pages/dashboard/IssueEditor";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/dashboard/AdminPanel";

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
  useEffect(() => {
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
              <Route path="/auth" element={<AuthPage />} />

              <Route path="/" element={<DashboardLayout />}>
                <Route path="homepage" element={<Dashboard />} />
                <Route path="article/:id" element={<ArticleViewer />} />
                <Route path="articles" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="edit" element={<Edit />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="edit/issue/:id" element={<IssueEditor />} />
                <Route path="edit/issue/new" element={<Edit />} />
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
