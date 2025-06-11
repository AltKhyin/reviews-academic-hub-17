
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Crown, User, Plus, Trash2 } from 'lucide-react';

interface UserData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  is_admin: boolean;
}

export const UserManagementPanel: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [promoting, setPromoting] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id');

      if (adminError) throw adminError;

      const adminUserIds = new Set(adminUsers?.map(admin => admin.user_id) || []);

      // Combine the data
      const usersWithAdminStatus = profiles?.map(profile => ({
        ...profile,
        is_admin: adminUserIds.has(profile.id)
      })) || [];

      setUsers(usersWithAdminStatus);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!isAdmin || promoting) return;

    try {
      setPromoting(userId);
      
      // Add user to admin_users table
      const { error } = await supabase
        .from('admin_users')
        .insert({ user_id: userId });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_admin: true } : user
      ));

      toast({
        title: 'Success',
        description: 'User promoted to admin successfully',
      });
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to promote user',
        variant: 'destructive'
      });
    } finally {
      setPromoting(null);
    }
  };

  const revokeAdmin = async (userId: string) => {
    if (!isAdmin || promoting || userId === user?.id) return;

    try {
      setPromoting(userId);
      
      // Remove user from admin_users table
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_admin: false } : user
      ));

      toast({
        title: 'Success',
        description: 'Admin privileges revoked successfully',
      });
    } catch (error: any) {
      console.error('Error revoking admin:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke admin privileges',
        variant: 'destructive'
      });
    } finally {
      setPromoting(null);
    }
  };

  const addUserByEmail = async () => {
    if (!searchEmail.trim() || !isAdmin) return;

    try {
      setLoading(true);
      
      toast({
        title: 'Info',
        description: 'Users must sign up first before they can be promoted to admin. Search for existing users below.',
        variant: 'default'
      });
      
      setSearchEmail('');
    } catch (error) {
      console.error('Error searching user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchEmail.toLowerCase()) ||
    user.id.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or ID..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={addUserByEmail} disabled={!searchEmail.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{users.filter(u => u.is_admin).length}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchEmail ? 'No users found matching your search.' : 'No users found.'}
            </div>
          ) : (
            filteredUsers.map((userData) => (
              <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={userData.avatar_url || undefined} />
                    <AvatarFallback>
                      {userData.full_name?.charAt(0) || userData.id.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium">
                      {userData.full_name || 'No name set'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {userData.id.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined: {new Date(userData.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {userData.is_admin && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Admin
                    </Badge>
                  )}
                  
                  {!userData.is_admin && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      User
                    </Badge>
                  )}
                  
                  {userData.id !== user?.id && (
                    <div className="flex gap-1">
                      {!userData.is_admin ? (
                        <Button
                          size="sm"
                          onClick={() => promoteToAdmin(userData.id)}
                          disabled={promoting === userData.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {promoting === userData.id ? 'Promoting...' : 'Make Admin'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => revokeAdmin(userData.id)}
                          disabled={promoting === userData.id}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {promoting === userData.id ? 'Revoking...' : 'Revoke'}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {userData.id === user?.id && (
                    <Badge variant="outline">You</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Users'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
