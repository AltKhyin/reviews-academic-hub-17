
// ABOUTME: Comprehensive analytics data collection for dashboard
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export interface AnalyticsData {
  userEngagement: {
    dailyActiveUsers: { date: string; count: number }[];
    totalUsers: number;
    newUsersThisWeek: number;
    averageSessionTime: number;
    topPages: { page: string; views: number }[];
    userRetention: { period: string; percentage: number }[];
  };
  contentMetrics: {
    totalIssues: number;
    publishedIssues: number;
    featuredIssues: number;
    mostViewedIssues: { id: string; title: string; views: number }[];
    issuesBySpecialty: { specialty: string; count: number }[];
    recentPublications: { date: string; count: number }[];
  };
  communityActivity: {
    totalPosts: number;
    totalComments: number;
    activeDiscussions: number;
    topContributors: { name: string; contributions: number }[];
    postsThisWeek: { date: string; count: number }[];
    commentsThisWeek: { date: string; count: number }[];
  };
  performance: {
    averageLoadTime: number;
    slowQueries: { query: string; duration: number }[];
    errorRate: number;
    uptimePercentage: number;
    cacheHitRate: number;
    databaseConnections: number;
  };
  systemHealth: {
    totalDbSize: string;
    activeConnections: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    lastBackup: string;
  };
}

const fetchUserEngagementData = async () => {
  const sevenDaysAgo = subDays(new Date(), 7);
  
  try {
    // Get total users
    const { data: totalUsersData } = await supabase.rpc('get_total_users');
    const totalUsers = totalUsersData || 0;

    // Get new users this week
    const { data: newUsers } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get daily active users (based on online_users table updates)
    const dailyActiveUsers = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const { data: dayUsers } = await supabase
        .from('profiles')
        .select('id')
        .gte('updated_at', startOfDay(date).toISOString())
        .lte('updated_at', endOfDay(date).toISOString());
      
      dailyActiveUsers.push({
        date: format(date, 'yyyy-MM-dd'),
        count: dayUsers?.length || 0
      });
    }

    // Mock data for metrics not directly available
    const topPages = [
      { page: '/homepage', views: 1250 },
      { page: '/acervo', views: 890 },
      { page: '/community', views: 650 },
      { page: '/search', views: 420 },
      { page: '/profile', views: 380 }
    ];

    const userRetention = [
      { period: '1 day', percentage: 75 },
      { period: '7 days', percentage: 45 },
      { period: '30 days', percentage: 25 },
      { period: '90 days', percentage: 15 }
    ];

    return {
      dailyActiveUsers,
      totalUsers,
      newUsersThisWeek: newUsers?.length || 0,
      averageSessionTime: 420, // 7 minutes in seconds
      topPages,
      userRetention
    };
  } catch (error) {
    console.error('Error fetching user engagement data:', error);
    return {
      dailyActiveUsers: [],
      totalUsers: 0,
      newUsersThisWeek: 0,
      averageSessionTime: 0,
      topPages: [],
      userRetention: []
    };
  }
};

const fetchContentMetrics = async () => {
  try {
    // Get issue statistics
    const { data: allIssues } = await supabase
      .from('issues')
      .select('id, title, specialty, published, featured, created_at');

    const totalIssues = allIssues?.length || 0;
    const publishedIssues = allIssues?.filter(issue => issue.published).length || 0;
    const featuredIssues = allIssues?.filter(issue => issue.featured).length || 0;

    // Get issues by specialty
    const specialtyCount: Record<string, number> = {};
    allIssues?.forEach(issue => {
      if (issue.specialty) {
        specialtyCount[issue.specialty] = (specialtyCount[issue.specialty] || 0) + 1;
      }
    });

    const issuesBySpecialty = Object.entries(specialtyCount)
      .map(([specialty, count]) => ({ specialty, count }))
      .sort((a, b) => b.count - a.count);

    // Get recent publications (last 7 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentPublications = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayIssues = allIssues?.filter(issue => 
        issue.published && 
        new Date(issue.created_at) >= startOfDay(date) &&
        new Date(issue.created_at) <= endOfDay(date)
      ).length || 0;
      
      recentPublications.push({
        date: format(date, 'yyyy-MM-dd'),
        count: dayIssues
      });
    }

    // Mock most viewed issues (would need analytics table in real app)
    const mostViewedIssues = allIssues?.slice(0, 5).map((issue, index) => ({
      id: issue.id,
      title: issue.title,
      views: 500 - (index * 50)
    })) || [];

    return {
      totalIssues,
      publishedIssues,
      featuredIssues,
      mostViewedIssues,
      issuesBySpecialty,
      recentPublications
    };
  } catch (error) {
    console.error('Error fetching content metrics:', error);
    return {
      totalIssues: 0,
      publishedIssues: 0,
      featuredIssues: 0,
      mostViewedIssues: [],
      issuesBySpecialty: [],
      recentPublications: []
    };
  }
};

const fetchCommunityActivity = async () => {
  try {
    // Get posts statistics
    const { data: allPosts } = await supabase
      .from('posts')
      .select('id, created_at, user_id, published');

    const totalPosts = allPosts?.filter(post => post.published).length || 0;

    // Get comments statistics
    const { data: allComments } = await supabase
      .from('comments')
      .select('id, created_at, user_id');

    const totalComments = allComments?.length || 0;

    // Calculate active discussions (posts with recent comments)
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentComments = allComments?.filter(comment => 
      new Date(comment.created_at) >= sevenDaysAgo
    );
    
    const activeDiscussions = new Set(
      recentComments?.map(comment => comment.post_id)
    ).size;

    // Get top contributors
    const contributorCounts: Record<string, number> = {};
    
    allPosts?.forEach(post => {
      if (post.user_id && post.published) {
        contributorCounts[post.user_id] = (contributorCounts[post.user_id] || 0) + 2;
      }
    });
    
    allComments?.forEach(comment => {
      if (comment.user_id) {
        contributorCounts[comment.user_id] = (contributorCounts[comment.user_id] || 0) + 1;
      }
    });

    // Get profiles for top contributors
    const topContributorIds = Object.entries(contributorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId]) => userId);

    const { data: topContributorProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', topContributorIds);

    const topContributors = topContributorIds.map(userId => {
      const profile = topContributorProfiles?.find(p => p.id === userId);
      return {
        name: profile?.full_name || 'Usuário Anônimo',
        contributions: contributorCounts[userId]
      };
    });

    // Get daily posts and comments for the last week
    const postsThisWeek = [];
    const commentsThisWeek = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      
      const dayPosts = allPosts?.filter(post => 
        post.published &&
        new Date(post.created_at) >= startOfDay(date) &&
        new Date(post.created_at) <= endOfDay(date)
      ).length || 0;
      
      const dayComments = allComments?.filter(comment => 
        new Date(comment.created_at) >= startOfDay(date) &&
        new Date(comment.created_at) <= endOfDay(date)
      ).length || 0;
      
      postsThisWeek.push({
        date: format(date, 'yyyy-MM-dd'),
        count: dayPosts
      });
      
      commentsThisWeek.push({
        date: format(date, 'yyyy-MM-dd'),
        count: dayComments
      });
    }

    return {
      totalPosts,
      totalComments,
      activeDiscussions,
      topContributors,
      postsThisWeek,
      commentsThisWeek
    };
  } catch (error) {
    console.error('Error fetching community activity:', error);
    return {
      totalPosts: 0,
      totalComments: 0,
      activeDiscussions: 0,
      topContributors: [],
      postsThisWeek: [],
      commentsThisWeek: []
    };
  }
};

const fetchPerformanceData = async () => {
  // Mock performance data (would need real monitoring in production)
  return {
    averageLoadTime: 1.2, // seconds
    slowQueries: [
      { query: 'SELECT * FROM issues WHERE published = true', duration: 250 },
      { query: 'SELECT * FROM comments JOIN profiles', duration: 180 },
      { query: 'SELECT * FROM posts WITH complex_join', duration: 150 }
    ],
    errorRate: 0.5, // percentage
    uptimePercentage: 99.8,
    cacheHitRate: 87.5, // percentage
    databaseConnections: 12
  };
};

const fetchSystemHealth = async () => {
  // Mock system health data (would need real monitoring in production)
  return {
    totalDbSize: '2.4 GB',
    activeConnections: 8,
    memoryUsage: 65.2, // percentage
    cpuUsage: 23.5, // percentage
    diskUsage: 34.8, // percentage
    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  };
};

const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    const [
      userEngagement,
      contentMetrics,
      communityActivity,
      performance,
      systemHealth
    ] = await Promise.all([
      fetchUserEngagementData(),
      fetchContentMetrics(),
      fetchCommunityActivity(),
      fetchPerformanceData(),
      fetchSystemHealth()
    ]);

    return {
      userEngagement,
      contentMetrics,
      communityActivity,
      performance,
      systemHealth
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

export const useAnalyticsData = () => {
  return useOptimizedQuery(
    queryKeys.analytics(),
    fetchAnalyticsData,
    {
      ...queryConfigs.realtime,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    }
  );
};
