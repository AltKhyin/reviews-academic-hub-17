// ABOUTME: Main App component with enhanced providers for API cascade prevention
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserInteractionProvider } from "@/contexts/UserInteractionContext";
import { SharedDataProvider } from "@/contexts/SharedDataProvider";
import { OptimizedAppProvider } from "@/components/optimization/OptimizedAppProvider";
import { GlobalErrorBoundary } from "@/components/error/GlobalErrorBoundary";
import { queryClient, initializeBackgroundOptimization } from "@/lib/queryClient";
import Index from "./pages/Index";
import Dashboard from "./pages/dashboard/Dashboard";
import Search from "./pages/search/Search";
import Article from "./pages/article/Article";
import Archive from "./pages/archive/Archive";
import Community from "./pages/community/Community";
import Profile from "./pages/profile/Profile";
import Admin from "./pages/admin/Admin";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import CommunityPost from "@/pages/community/CommunityPost";
import EditArticle from "@/pages/admin/EditArticle";
import EditIssue from "@/pages/admin/EditIssue";
import NewArticle from "@/pages/admin/NewArticle";
import NewIssue from "@/pages/admin/NewIssue";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import IssuesManagementPanel from "@/components/admin/IssuesManagementPanel";
import { NativeEditor } from "@/components/editor/NativeEditor";
import PDFViewer from "@/components/pdf/PDFViewer";

// Initialize background optimization on app start
initializeBackgroundOptimization();

const App = () => {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OptimizedAppProvider>
          <BrowserRouter>
            <AuthProvider>
              <UserInteractionProvider>
                <SharedDataProvider>
                  <TooltipProvider>
                    <div className="min-h-screen bg-background font-sans antialiased">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/article/:id" element={<Article />} />
                        <Route path="/archive" element={<Archive />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/community/post/:id" element={<CommunityPost />} />
                        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                        <Route path="/admin/edit-article/:id" element={<ProtectedRoute><EditArticle /></ProtectedRoute>} />
                        <Route path="/admin/edit-issue/:id" element={<ProtectedRoute><EditIssue /></ProtectedRoute>} />
                        <Route path="/admin/new-article" element={<ProtectedRoute><NewArticle /></ProtectedRoute>} />
                        <Route path="/admin/new-issue" element={<ProtectedRoute><NewIssue /></ProtectedRoute>} />
	
                        <Route path="/auth/signin" element={<SignIn />} />
                        <Route path="/auth/signup" element={<SignUp />} />
                      </Routes>
                    </div>
                    <Toaster />
                    <Sonner />
                  </TooltipProvider>
                </SharedDataProvider>
              </UserInteractionProvider>
            </AuthProvider>
          </BrowserRouter>
        </OptimizedAppProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
