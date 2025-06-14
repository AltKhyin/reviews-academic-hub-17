
// ABOUTME: Dashboard with proper API monitoring integration
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiCallMonitor } from '@/middleware/ApiCallMiddleware';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  // Get API call statistics
  const apiStats = apiCallMonitor.getStats();
  const recentCalls = apiCallMonitor.getTotalCallsInLastMinute();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Welcome, {user?.email}
            </span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiStats.totalCalls}</div>
              <p className="text-xs text-muted-foreground">
                {recentCalls} in last minute
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apiStats.totalCalls > 0 
                  ? Math.round((apiStats.successfulCalls / apiStats.totalCalls) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {apiStats.successfulCalls} successful calls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(apiStats.averageResponseTime || 0)}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Last minute average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiStats.failedCalls}</div>
              <p className="text-xs text-muted-foreground">
                Total failures
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Archive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Browse published issues and reviews
              </p>
              <Button asChild className="w-full">
                <Link to="/archive">
                  Browse Archive
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Join discussions and community posts
              </p>
              <Button asChild className="w-full">
                <Link to="/community">
                  View Community
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage your profile and settings
              </p>
              <Button asChild className="w-full">
                <Link to="/profile">
                  Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
