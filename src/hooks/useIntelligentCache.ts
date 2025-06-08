
// ABOUTME: Intelligent cache invalidation system with dependency tracking and predictive invalidation
import { useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CacheDependency {
  queryKey: unknown[];
  dependencies: string[];
  lastAccessed: number;
  accessCount: number;
  invalidationRules: InvalidationRule[];
}

interface InvalidationRule {
  trigger: string; // What triggers invalidation
  pattern: RegExp; // Pattern to match query keys
  delay?: number; // Optional delay before invalidation
  cascade?: boolean; // Whether to cascade to dependent queries
}

interface CacheStats {
  totalQueries: number;
  dependentQueries: number;
  invalidationEvents: number;
  cacheHitRate: number;
  averageAccessTime: number;
}

export const useIntelligentCache = () => {
  const queryClient = useQueryClient();
  const dependencies = useRef<Map<string, CacheDependency>>(new Map());
  const invalidationStats = useRef({
    totalInvalidations: 0,
    cascadeInvalidations: 0,
    predictiveInvalidations: 0,
  });

  // Built-in invalidation rules
  const defaultInvalidationRules: InvalidationRule[] = [
    {
      trigger: 'user-action',
      pattern: /^(posts|comments|profile)/,
      delay: 100,
      cascade: true,
    },
    {
      trigger: 'data-mutation',
      pattern: /^(issues|articles)/,
      delay: 50,
      cascade: true,
    },
    {
      trigger: 'auth-change',
      pattern: /^(user|auth|permissions)/,
      delay: 0,
      cascade: true,
    },
    {
      trigger: 'time-based',
      pattern: /^(analytics|stats)/,
      delay: 5000,
      cascade: false,
    },
  ];

  // Register cache dependency
  const registerDependency = useCallback((
    queryKey: unknown[],
    dependsOn: string[],
    customRules?: InvalidationRule[]
  ) => {
    const keyString = JSON.stringify(queryKey);
    const rules = [...defaultInvalidationRules, ...(customRules || [])];
    
    dependencies.current.set(keyString, {
      queryKey,
      dependencies: dependsOn,
      lastAccessed: Date.now(),
      accessCount: 1,
      invalidationRules: rules,
    });
  }, []);

  // Track query access
  const trackAccess = useCallback((queryKey: unknown[]) => {
    const keyString = JSON.stringify(queryKey);
    const dependency = dependencies.current.get(keyString);
    
    if (dependency) {
      dependency.lastAccessed = Date.now();
      dependency.accessCount++;
    }
  }, []);

  // Intelligent invalidation based on data relationships
  const invalidateRelated = useCallback((trigger: string, context?: Record<string, any>) => {
    const affectedQueries: string[] = [];
    
    dependencies.current.forEach((dependency, keyString) => {
      const shouldInvalidate = dependency.invalidationRules.some(rule => {
        if (rule.trigger !== trigger) return false;
        
        // Check if query key matches the pattern
        return rule.pattern.test(keyString);
      });
      
      if (shouldInvalidate) {
        const rule = dependency.invalidationRules.find(r => r.trigger === trigger);
        
        const executeInvalidation = () => {
          queryClient.invalidateQueries({ queryKey: dependency.queryKey });
          affectedQueries.push(keyString);
          invalidationStats.current.totalInvalidations++;
          
          // Cascade invalidation if enabled
          if (rule?.cascade) {
            dependency.dependencies.forEach(depKey => {
              const relatedQueries = Array.from(dependencies.current.entries())
                .filter(([_, dep]) => dep.dependencies.includes(depKey));
              
              relatedQueries.forEach(([relatedKey, relatedDep]) => {
                queryClient.invalidateQueries({ queryKey: relatedDep.queryKey });
                affectedQueries.push(relatedKey);
                invalidationStats.current.cascadeInvalidations++;
              });
            });
          }
        };
        
        if (rule?.delay) {
          setTimeout(executeInvalidation, rule.delay);
        } else {
          executeInvalidation();
        }
      }
    });
    
    if (affectedQueries.length > 0) {
      console.log(`🔄 Invalidated ${affectedQueries.length} queries for trigger: ${trigger}`, affectedQueries);
    }
    
    return affectedQueries;
  }, [queryClient]);

  // Predictive invalidation based on usage patterns
  const predictiveInvalidation = useCallback(() => {
    const now = Date.now();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes
    const lowUsageThreshold = 2; // Less than 2 accesses
    
    const staleCandidates: string[] = [];
    
    dependencies.current.forEach((dependency, keyString) => {
      const timeSinceAccess = now - dependency.lastAccessed;
      const isStale = timeSinceAccess > staleThreshold;
      const isLowUsage = dependency.accessCount < lowUsageThreshold;
      
      // Predictively invalidate stale, low-usage queries
      if (isStale && isLowUsage) {
        queryClient.removeQueries({ queryKey: dependency.queryKey });
        staleCandidates.push(keyString);
        dependencies.current.delete(keyString);
        invalidationStats.current.predictiveInvalidations++;
      }
    });
    
    if (staleCandidates.length > 0) {
      console.log(`🧹 Predictively removed ${staleCandidates.length} stale queries`);
    }
    
    return staleCandidates;
  }, [queryClient]);

  // Smart cache warming based on access patterns
  const warmCache = useCallback(async (priority: 'high' | 'medium' | 'low' = 'medium') => {
    const frequentlyAccessed = Array.from(dependencies.current.entries())
      .filter(([_, dep]) => dep.accessCount > 5)
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .slice(0, priority === 'high' ? 10 : priority === 'medium' ? 5 : 3);
    
    const warmupPromises = frequentlyAccessed.map(([_, dependency]) => {
      return queryClient.prefetchQuery({ queryKey: dependency.queryKey });
    });
    
    try {
      await Promise.allSettled(warmupPromises);
      console.log(`🔥 Cache warmed for ${warmupPromises.length} frequently accessed queries`);
    } catch (error) {
      console.warn('Cache warming failed:', error);
    }
  }, [queryClient]);

  // Get cache statistics
  const getCacheStats = useCallback((): CacheStats => {
    const cache = queryClient.getQueryCache();
    const allQueries = cache.getAll();
    const dependentQueries = dependencies.current.size;
    
    // Calculate cache hit rate (simplified)
    const queriesWithData = allQueries.filter(q => q.state.data).length;
    const cacheHitRate = allQueries.length > 0 ? (queriesWithData / allQueries.length) * 100 : 0;
    
    // Calculate average access time
    const accessTimes = Array.from(dependencies.current.values())
      .map(dep => Date.now() - dep.lastAccessed);
    const averageAccessTime = accessTimes.length > 0 
      ? accessTimes.reduce((sum, time) => sum + time, 0) / accessTimes.length 
      : 0;
    
    return {
      totalQueries: allQueries.length,
      dependentQueries,
      invalidationEvents: invalidationStats.current.totalInvalidations,
      cacheHitRate,
      averageAccessTime,
    };
  }, [queryClient]);

  // Automatic cache maintenance
  useEffect(() => {
    const maintenanceInterval = setInterval(() => {
      predictiveInvalidation();
      
      // Warm cache for high-priority queries every 5 minutes
      if (Date.now() % (5 * 60 * 1000) < 30000) { // Within 30 seconds of 5-minute mark
        warmCache('medium');
      }
    }, 30000); // Run every 30 seconds
    
    return () => clearInterval(maintenanceInterval);
  }, [predictiveInvalidation, warmCache]);

  // Add cache dependency on query creation
  const withDependencies = useCallback(<TData>(
    queryKey: unknown[],
    queryFn: () => Promise<TData>,
    dependencies: string[],
    customRules?: InvalidationRule[]
  ) => {
    // Register dependency when query is created
    registerDependency(queryKey, dependencies, customRules);
    
    // Track access when query function is called
    return async (): Promise<TData> => {
      trackAccess(queryKey);
      return queryFn();
    };
  }, [registerDependency, trackAccess]);

  return {
    registerDependency,
    trackAccess,
    invalidateRelated,
    predictiveInvalidation,
    warmCache,
    getCacheStats,
    withDependencies,
    invalidationStats: invalidationStats.current,
  };
};
