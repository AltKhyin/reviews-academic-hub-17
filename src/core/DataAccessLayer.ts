
// ABOUTME: Unified data access layer replacing scattered Supabase calls
import { supabase } from '@/integrations/supabase/client';
import { GlobalRequestManager } from './GlobalRequestManager';
import { CacheManager } from './CacheManager';

export interface DataOperation {
  type: 'query' | 'mutation' | 'subscription';
  resource: string;
  parameters?: Record<string, any>;
  cacheKey?: string;
}

export interface DataResponse<T> {
  data: T;
  error: Error | null;
  loading: boolean;
  fromCache: boolean;
}

export class DataAccessLayer {
  private static instance: DataAccessLayer;
  private requestManager: GlobalRequestManager;
  private cacheManager: CacheManager;

  private constructor() {
    this.requestManager = GlobalRequestManager.getInstance();
    this.cacheManager = new CacheManager({
      defaultTTL: 5 * 60 * 1000, // 5 minutes for data operations
      maxSize: 500,
      evictionPolicy: 'LRU'
    });
  }

  static getInstance(): DataAccessLayer {
    if (!DataAccessLayer.instance) {
      DataAccessLayer.instance = new DataAccessLayer();
    }
    return DataAccessLayer.instance;
  }

  async executeOperation<T>(operation: DataOperation): Promise<DataResponse<T>> {
    try {
      const operationKey = this.generateOperationKey(operation);
      
      const response = await this.requestManager.executeRequest({
        key: operationKey,
        operation: () => this.performOperation<T>(operation),
        priority: this.determinePriority(operation),
        cacheTTL: this.getCacheTTL(operation),
      });

      return {
        data: response,
        error: null,
        loading: false,
        fromCache: false,
      };
    } catch (error) {
      return this.handleDataError(error as Error, operation);
    }
  }

  private async performOperation<T>(operation: DataOperation): Promise<T> {
    switch (operation.type) {
      case 'query':
        return this.executeQuery<T>(operation);
      case 'mutation':
        return this.executeMutation<T>(operation);
      case 'subscription':
        return this.executeSubscription<T>(operation);
      default:
        throw new Error(`Unsupported operation type: ${operation.type}`);
    }
  }

  private async executeQuery<T>(operation: DataOperation): Promise<T> {
    const { resource, parameters = {} } = operation;
    
    let query = supabase.from(resource).select('*');
    
    // Apply filters and parameters
    if (parameters.id) {
      query = query.eq('id', parameters.id);
    }
    
    if (parameters.user_id) {
      query = query.eq('user_id', parameters.user_id);
    }
    
    if (parameters.published !== undefined) {
      query = query.eq('published', parameters.published);
    }
    
    if (parameters.limit) {
      query = query.limit(parameters.limit);
    }
    
    if (parameters.order) {
      const { column, ascending = false } = parameters.order;
      query = query.order(column, { ascending });
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Query failed for ${resource}: ${error.message}`);
    }
    
    return data as T;
  }

  private async executeMutation<T>(operation: DataOperation): Promise<T> {
    const { resource, parameters = {} } = operation;
    
    if (parameters.action === 'insert') {
      const { data, error } = await supabase
        .from(resource)
        .insert(parameters.data)
        .select();
      
      if (error) {
        throw new Error(`Insert failed for ${resource}: ${error.message}`);
      }
      
      // Invalidate related cache
      await this.invalidateResourceCache(resource);
      
      return data as T;
    }
    
    if (parameters.action === 'update') {
      const { data, error } = await supabase
        .from(resource)
        .update(parameters.data)
        .eq('id', parameters.id)
        .select();
      
      if (error) {
        throw new Error(`Update failed for ${resource}: ${error.message}`);
      }
      
      // Invalidate related cache
      await this.invalidateResourceCache(resource);
      
      return data as T;
    }
    
    if (parameters.action === 'delete') {
      const { data, error } = await supabase
        .from(resource)
        .delete()
        .eq('id', parameters.id)
        .select();
      
      if (error) {
        throw new Error(`Delete failed for ${resource}: ${error.message}`);
      }
      
      // Invalidate related cache
      await this.invalidateResourceCache(resource);
      
      return data as T;
    }
    
    throw new Error(`Unsupported mutation action: ${parameters.action}`);
  }

  private async executeSubscription<T>(operation: DataOperation): Promise<T> {
    // For now, subscriptions will be handled separately
    // This is a placeholder for future real-time functionality
    throw new Error('Subscriptions not implemented yet');
  }

  private generateOperationKey(operation: DataOperation): string {
    const params = JSON.stringify(operation.parameters || {}, Object.keys(operation.parameters || {}).sort());
    return `${operation.type}:${operation.resource}:${params}`;
  }

  private determinePriority(operation: DataOperation): 'critical' | 'normal' | 'background' {
    // Critical operations
    if (operation.resource === 'issues' && operation.parameters?.featured) {
      return 'critical';
    }
    
    if (operation.type === 'mutation') {
      return 'critical';
    }
    
    // Background operations
    if (operation.resource === 'review_analytics') {
      return 'background';
    }
    
    return 'normal';
  }

  private getCacheTTL(operation: DataOperation): number {
    // Different TTL for different resources
    const ttlMap: Record<string, number> = {
      'issues': 5 * 60 * 1000, // 5 minutes
      'user_bookmarks': 2 * 60 * 1000, // 2 minutes
      'user_article_reactions': 1 * 60 * 1000, // 1 minute
      'profiles': 10 * 60 * 1000, // 10 minutes
      'review_analytics': 30 * 60 * 1000, // 30 minutes
    };
    
    return ttlMap[operation.resource] || 5 * 60 * 1000;
  }

  private handleDataError<T>(error: Error, operation: DataOperation): DataResponse<T> {
    console.error(`Data operation failed:`, error, operation);
    
    return {
      data: null as T,
      error,
      loading: false,
      fromCache: false,
    };
  }

  private async invalidateResourceCache(resource: string): Promise<void> {
    // Invalidate all cache entries related to this resource
    await this.cacheManager.invalidatePattern(`.*:${resource}:.*`);
  }

  async invalidateCache(pattern?: string): Promise<void> {
    if (pattern) {
      await this.cacheManager.invalidatePattern(pattern);
    } else {
      this.cacheManager.clear();
    }
  }

  getStats() {
    return {
      requestManager: this.requestManager.getRequestMetrics(),
      cache: this.cacheManager.getCacheStats(),
    };
  }
}
