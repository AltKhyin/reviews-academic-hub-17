
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/dashboard/Dashboard';
import ArticleViewer from '@/pages/dashboard/ArticleViewer';
import Community from '@/pages/dashboard/Community';
import Edit from '@/pages/dashboard/Edit';
import IssueEditor from '@/pages/dashboard/IssueEditor';
import IssueCreator from '@/pages/dashboard/IssueCreator';
import Profile from '@/pages/dashboard/Profile';
import SearchPage from '@/pages/dashboard/SearchPage';
import NotFound from '@/pages/NotFound';
import PolicyPage from '@/pages/PolicyPage';
import DashboardLayout from '@/layouts/DashboardLayout';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <SidebarProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/policy" element={<PolicyPage />} />

              {/* Dashboard routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="articles/:id" element={<ArticleViewer />} />
                <Route path="community" element={<Community />} />
                <Route path="profile" element={<Profile />} />
                <Route path="search" element={<SearchPage />} />
              </Route>

              {/* Admin/Editor routes */}
              <Route path="/edit" element={<DashboardLayout />}>
                <Route index element={<Edit />} />
              </Route>

              {/* Issue management routes */}
              <Route path="/issues" element={<DashboardLayout />}>
                <Route path="create" element={<IssueCreator />} />
                <Route path=":id" element={<ArticleViewer />} />
                <Route path=":id/edit" element={<IssueEditor />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
