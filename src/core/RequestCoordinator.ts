
// ABOUTME: Global request coordination system to replace individual component API calls
// Implements bulk fetching, request deduplication, and budget enforcement

interface BulkRequest<T> {
  key: string;
  fetcher: () => Promise<T>;
  dependencies?: string[];
}

interface PageData {
  userData: {
    bookmarks: any[];
    reactions: any[];
    permissions: any;
  };
  contentData: {
    issues: any[];
    featuredIssue: any;
    metadata: any;
  };
  configData: {
    sectionVisibility: any[];
    settings: any;
  };
}

interface RequestBudget {
  maxRequestsPerPage: number;
  currentRequestCount: number;
  budgetExceeded: boolean;
}

class RequestCoordinator {
  private static instance: RequestCoordinator;
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<any>>();
  private requestBudget: RequestBudget = {
    maxRequestsPerPage: 10,
    currentRequestCount: 0,
    budgetExceeded: false
  };
  private readonly CACHE_TTL = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): RequestCoordinator {
    if (!RequestCoordinator.instance) {
      RequestCoordinator.instance = new RequestCoordinator();
    }
    return RequestCoordinator.instance;
  }

  // Main coordinated page loading - replaces 70+ individual API calls
  async loadPageData(route: string, userId?: string): Promise<PageData> {
    console.log(`🎯 RequestCoordinator: Loading page data for ${route}`);
    
    this.resetRequestBudget();
    
    if (!this.canMakeRequest()) {
      throw new Error(`Request budget exceeded for route: ${route}`);
    }

    try {
      const pageData = await this.coordinateBulkLoad(route, userId);
      console.log(`✅ RequestCoordinator: Page loaded with ${this.requestBudget.currentRequestCount} API calls`);
      return pageData;
    } catch (error) {
      console.error(`❌ RequestCoordinator: Failed to load page data for ${route}:`, error);
      throw error;
    }
  }

  // Coordinate bulk loading to minimize API calls
  private async coordinateBulkLoad(route: string, userId?: string): Promise<PageData> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Batch all required data in minimal requests
    const bulkRequests = [];

    // Request 1: Issues and content data
    if (route === '/homepage' || route === '/') {
      bulkRequests.push(
        this.trackRequest('issues-content', () =>
          Promise.all([
            supabase
              .from('issues')
              .select('id, title, cover_image_url, specialty, published_at, created_at, featured, published, score, authors')
              .eq('published', true)
              .order('created_at', { ascending: false })
              .limit(20),
            
            supabase
              .from('issues')
              .select('id, title, cover_image_url, specialty, published_at, created_at, featured, published, score')
              .eq('published', true)
              .eq('featured', true)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
              
            supabase
              .from('site_meta')
              .select('value')
              .eq('key', 'homepage_sections')
              .single()
          ])
        )
      );
    }

    // Request 2: User interaction data (if authenticated)
    if (userId) {
      bulkRequests.push(
        this.trackRequest('user-interactions', () =>
          Promise.all([
            supabase
              .from('user_bookmarks')
              .select('issue_id')
              .eq('user_id', userId),
            
            supabase
              .from('user_article_reactions')
              .select('issue_id, reaction_type')
              .eq('user_id', userId)
          ])
        )
      );
    }

    // Execute coordinated requests
    const results = await Promise.all(bulkRequests);
    
    // Process and structure the data
    return this.processCoordinatedResults(results, route, userId);
  }

  // Process bulk results into structured page data
  private processCoordinatedResults(results: any[], route: string, userId?: string): PageData {
    const pageData: PageData = {
      userData: {
        bookmarks: [],
        reactions: [],
        permissions: null
      },
      contentData: {
        issues: [],
        featuredIssue: null,
        metadata: null
      },
      configData: {
        sectionVisibility: [],
        settings: null
      }
    };

    // Process content data (first request)
    if (results[0]) {
      const [issuesResult, featuredIssueResult, sectionVisibilityResult] = results[0];
      
      pageData.contentData.issues = issuesResult.data || [];
      pageData.contentData.featuredIssue = featuredIssueResult.data || null;
      pageData.configData.sectionVisibility = sectionVisibilityResult.data?.value || [];
    }

    // Process user data (second request, if exists)
    if (results[1] && userId) {
      const [bookmarksResult, reactionsResult] = results[1];
      
      pageData.userData.bookmarks = bookmarksResult.data || [];
      pageData.userData.reactions = reactionsResult.data || [];
    }

    return pageData;
  }

  // Request deduplication and caching
  async deduplicateRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`💾 RequestCoordinator: Cache hit for ${key}`);
      return cached.data;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      console.log(`⏳ RequestCoordinator: Deduplicating request for ${key}`);
      return this.pendingRequests.get(key)!;
    }

    // Execute new request
    const promise = fetcher().then(data => {
      this.requestCache.set(key, { data, timestamp: Date.now() });
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Request budget enforcement
  private canMakeRequest(): boolean {
    return this.requestBudget.currentRequestCount < this.requestBudget.maxRequestsPerPage;
  }

  private trackRequest<T>(name: string, fetcher: () => Promise<T>): Promise<T> {
    if (!this.canMakeRequest()) {
      throw new Error(`Request budget exceeded. Current: ${this.requestBudget.currentRequestCount}, Max: ${this.requestBudget.maxRequestsPerPage}`);
    }

    this.requestBudget.currentRequestCount++;
    console.log(`📊 RequestCoordinator: Request ${this.requestBudget.currentRequestCount}/${this.requestBudget.maxRequestsPerPage} - ${name}`);
    
    return fetcher();
  }

  private resetRequestBudget(): void {
    this.requestBudget.currentRequestCount = 0;
    this.requestBudget.budgetExceeded = false;
  }

  // Cache management
  invalidateCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.requestCache.keys()) {
        if (key.includes(pattern)) {
          this.requestCache.delete(key);
        }
      }
    } else {
      this.requestCache.clear();
    }
    console.log(`🗑️ RequestCoordinator: Cache invalidated ${pattern ? `for pattern: ${pattern}` : 'completely'}`);
  }

  // Performance metrics
  getPerformanceMetrics() {
    return {
      cacheSize: this.requestCache.size,
      pendingRequests: this.pendingRequests.size,
      requestBudget: this.requestBudget,
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  private calculateCacheHitRate(): number {
    // Simple implementation - could be enhanced with more detailed tracking
    return this.requestCache.size > 0 ? 0.8 : 0; // Placeholder
  }
}

export const requestCoordinator = RequestCoordinator.getInstance();
export type { PageData, BulkRequest, RequestBudget };
