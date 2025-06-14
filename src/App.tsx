import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/layouts/MainLayout';
import Loading from '@/components/ui/Loading';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const IssuePage = lazy(() => import('./pages/IssuePage'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const IssueEditor = lazy(() => import('./pages/dashboard/IssueEditor').then(module => ({ default: module.IssueEditor })));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  return (
    <AuthProvider>
      <CommunityProvider>
        <Router>
          <MainLayout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
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
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </MainLayout>
        </Router>
        <Toaster />
      </CommunityProvider>
    </AuthProvider>
  );
}

export default App;
