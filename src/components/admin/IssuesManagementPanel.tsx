
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { IssueCard } from '@/pages/dashboard/components/IssueCard';
import { Issue } from '@/types/issue';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const IssuesManagementPanel = () => {
  const { isAdmin, isEditor, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Fetch all issues with enhanced error handling
  const { data: issues = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-issues', searchQuery, filterStatus],
    queryFn: async () => {
      console.log("Fetching issues for admin panel...");
      try {
        let query = supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply status filter
        if (filterStatus === 'published') {
          query = query.eq('published', true);
        } else if (filterStatus === 'draft') {
          query = query.eq('published', false);
        }

        // Apply search filter
        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,specialty.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching issues:", error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} issues`);
        return data as Issue[];
      } catch (error: any) {
        console.error("Exception in issues fetch:", error);
        throw error;
      }
    },
    enabled: !!(isAdmin || isEditor), // Only fetch if user has permissions
    staleTime: 0, // Always fetch fresh data for admin
    refetchOnMount: true,
  });

  // Delete issue mutation
  const deleteIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId);
      
      if (error) throw error;
      return issueId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({
        title: "Issue deleted",
        description: "The issue has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle publish status mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ issueId, published }: { issueId: string; published: boolean }) => {
      const updateData: any = { 
        published,
        updated_at: new Date().toISOString()
      };
      
      if (published) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', issueId);
      
      if (error) throw error;
      return { issueId, published };
    },
    onSuccess: ({ published }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({
        title: published ? "Issue published" : "Issue unpublished",
        description: published 
          ? "The issue is now visible to all users." 
          : "The issue is now hidden from users.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatTags = (specialtyString: string): string => {
    if (!specialtyString) return '';
    return specialtyString.split(', ').map(tag => `#${tag}`).join(' ');
  };

  const handleCreateNew = () => {
    navigate('/edit/issue/new');
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      deleteIssueMutation.mutate(issueId);
    }
  };

  const handleTogglePublish = async (issue: Issue) => {
    togglePublishMutation.mutate({ 
      issueId: issue.id, 
      published: !issue.published 
    });
  };

  // Filter issues based on search and status
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = !searchQuery || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.description && issue.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      issue.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && issue.published) ||
      (filterStatus === 'draft' && !issue.published);
    
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin && !isEditor) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to manage issues.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Failed to load issues: {error.message}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Issues Management</h2>
          <p className="text-muted-foreground">
            Manage all issues, articles, and publications
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Issue
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search issues by title, description, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({issues.length})
              </Button>
              <Button
                variant={filterStatus === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('published')}
              >
                Published ({issues.filter(i => i.published).length})
              </Button>
              <Button
                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('draft')}
              >
                Drafts ({issues.filter(i => !i.published).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading issues...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'No issues match your search criteria.' 
                    : 'No issues found. Create your first issue to get started.'}
                </p>
                {(!searchQuery && filterStatus === 'all') && (
                  <Button onClick={handleCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Issue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className="hover:bg-accent/5 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium truncate">
                          {issue.title}
                        </h3>
                        <Badge variant={issue.published ? 'default' : 'secondary'}>
                          {issue.published ? 'Published' : 'Draft'}
                        </Badge>
                        {issue.featured && (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      {issue.description && (
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                          {issue.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                        {issue.published_at && (
                          <span>• Published: {new Date(issue.published_at).toLocaleDateString()}</span>
                        )}
                        {issue.specialty && (
                          <span>• Tags: {formatTags(issue.specialty)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/edit/issue/${issue.id}`}>
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant={issue.published ? "secondary" : "default"}
                        size="sm"
                        onClick={() => handleTogglePublish(issue)}
                        disabled={togglePublishMutation.isPending}
                      >
                        {issue.published ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteIssue(issue.id)}
                        disabled={deleteIssueMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredIssues.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <span>Total: {filteredIssues.length}</span>
              <span>Published: {filteredIssues.filter(i => i.published).length}</span>
              <span>Drafts: {filteredIssues.filter(i => !i.published).length}</span>
              <span>Featured: {filteredIssues.filter(i => i.featured).length}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
