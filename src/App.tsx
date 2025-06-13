
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { queryClient, initializeBackgroundOptimization } from "@/lib/queryClient";
import Index from "./pages/Index";
import Dashboard from "./pages/dashboard/Dashboard";
import Community from "./pages/dashboard/Community";
import ArchivePage from "./pages/dashboard/ArchivePage";
import EnhancedArticleViewer from "./pages/dashboard/EnhancedArticleViewer";
import SearchPage from "./pages/dashboard/SearchPage";
import Profile from "./pages/dashboard/Profile";
import IssueEditor from "./pages/dashboard/IssueEditor";
import AuthPage from "./pages/auth/AuthPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";
import PolicyPage from "./pages/PolicyPage";
import { AuthProvider } from "./contexts/AuthContext";
import { PerformanceProvider } from "./providers/PerformanceProvider";
import { OptimizedAppProvider } from "./components/optimization/OptimizedAppProvider";
import BundleOptimizer from "./utils/bundleOptimizer";
import GlobalErrorBoundary from "./components/error/GlobalErrorBoundary";
import { useGlobalMemoryMonitor } from "./hooks/useMemoryOptimizer";
import { useEffect } from "react";
import "./App.css";

function AppContent() {
  // Global memory monitoring
  useGlobalMemoryMonitor();

  // Initialize performance optimizations
  useEffect(() => {
    initializeBackgroundOptimization();
    BundleOptimizer.preloadCriticalComponents();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/community" element={<Community />} />
      <Route path="/acervo" element={<ArchivePage />} />
      <Route path="/artigo/:id" element={<EnhancedArticleViewer />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/editor/:id?" element={<IssueEditor />} />
      <Route path="/privacy" element={<PolicyPage />} />
      <Route path="/terms" element={<PolicyPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <GlobalErrorBoundary onError={(error, errorInfo) => {
      // Log to external service in production
      console.error('Global error:', error, errorInfo);
    }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PerformanceProvider>
            <OptimizedAppProvider>
              <TooltipProvider>
                <Toaster />
                <AppContent />
              </TooltipProvider>
            </OptimizedAppProvider>
          </PerformanceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
