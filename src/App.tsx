
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/Index'));
const LoginPage = lazy(() => import('./pages/auth/Login'));
const RegisterPage = lazy(() => import('./pages/auth/Register'));
const ProfilePage = lazy(() => import('./pages/dashboard/Profile'));
const CommunityPage = lazy(() => import('./pages/dashboard/Community'));
const ArchivePage = lazy(() => import('./pages/dashboard/ArchivePage'));
const IssuePage = lazy(() => import('./pages/dashboard/ArticleViewer'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const IssueEditor = lazy(() => import('./pages/dashboard/IssueEditor').then(module => ({ default: module.IssueEditor })));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <Skeleton className="w-full h-full" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/archive/:id" element={<IssuePage />} />
            <Route path="/community" element={<CommunityPage />} />
            
            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
             <Route
              path="/dashboard/editor/:id"
              element={
                <ProtectedRoute>
                  <IssueEditor />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
