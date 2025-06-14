
import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/Index'));
const AuthPage = lazy(() => import('./pages/auth/Login'));
const HomePage = lazy(() => import('./pages/Index'));
const ArchivePage = lazy(() => import('./pages/dashboard/ArchivePage'));
const EditPage = lazy(() => import('./pages/dashboard/Edit'));
const CommunityPage = lazy(() => import('./pages/dashboard/Community'));
const SearchPage = lazy(() => import('./pages/dashboard/SearchPage'));
const ProfilePage = lazy(() => import('./pages/dashboard/Profile'));
const IssuePage = lazy(() => import('./pages/dashboard/ArticleViewer'));
const IssueEditor = lazy(() => import('./pages/dashboard/IssueEditor').then(module => ({ default: module.IssueEditor })));

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <Skeleton className="w-full h-full" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Core routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            
            {/* Archive routes */}
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/acervo" element={<ArchivePage />} />
            <Route path="/archive/:id" element={<IssuePage />} />
            <Route path="/review/:id" element={<IssuePage />} />
            
            {/* Community route */}
            <Route path="/community" element={<CommunityPage />} />
            
            {/* Search route - Admin protected */}
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Edit route - Admin protected */}
            <Route 
              path="/edit" 
              element={
                <ProtectedRoute>
                  <EditPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* Editor route */}
            <Route
              path="/editor/:id"
              element={
                <ProtectedRoute>
                  <IssueEditor />
                </ProtectedRoute>
              }
            />
            
            {/* Legacy dashboard routes - redirect to proper routes */}
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/dashboard/editor/:id" element={<IssueEditor />} />
          </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
