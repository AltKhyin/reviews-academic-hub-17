
// ABOUTME: Advanced caching system with intelligent invalidation and memory management
import { useCallback, useRef, useMemo } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  enableLRU?: boolean; // Least Recently Used eviction
}

const DEFAULT_CONFIG: Required<CacheConfig> = {
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5 minutes
  enableLRU: true,
};

// Global cache storage
const globalCache = new Map<string, CacheEntry<any>>();

export const useAdvancedCaching = <T>(config?: CacheConfig) => {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const cacheStatsRef = useRef({
    hits: 0,
    misses: 0,
    evictions: 0,
  });

  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    let evicted = 0;
    
    for (const [key, entry] of globalCache.entries()) {
      if (now - entry.timestamp > finalConfig.ttl) {
        globalCache.delete(key);
        evicted++;
      }
    }
    
    if (evicted > 0) {
      cacheStatsRef.current.evictions += evicted;
      console.log(`🧹 Cache cleanup: Evicted ${evicted} expired entries`);
    }
  }, [finalConfig.ttl]);

  const evictLRU = useCallback(() => {
    if (!finalConfig.enableLRU || globalCache.size <= finalConfig.maxSize) {
      return;
    }

    // Find least recently used entry
    let lruKey = '';
    let oldestAccess = Date.now();
    
    for (const [key, entry] of globalCache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      globalCache.delete(lruKey);
      cacheStatsRef.current.evictions++;
      console.log(`🗑️ Cache LRU eviction: Removed ${lruKey}`);
    }
  }, [finalConfig.enableLRU, finalConfig.maxSize]);

  const get = useCallback(<K extends T>(key: string): K | null => {
    cleanupExpired();
    
    const entry = globalCache.get(key);
    if (!entry) {
      cacheStatsRef.current.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > finalConfig.ttl) {
      globalCache.delete(key);
      cacheStatsRef.current.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    cacheStatsRef.current.hits++;
    
    return entry.data as K;
  }, [cleanupExpired, finalConfig.ttl]);

  const set = useCallback(<K extends T>(key: string, data: K): void => {
    const now = Date.now();
    
    // Cleanup before adding new entry
    cleanupExpired();
    evictLRU();
    
    globalCache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    });
    
    console.log(`💾 Cache set: ${key} (size: ${globalCache.size})`);
  }, [cleanupExpired, evictLRU]);

  const invalidate = useCallback((pattern?: string): number => {
    let deleted = 0;
    
    if (!pattern) {
      deleted = globalCache.size;
      globalCache.clear();
      console.log(`🔄 Cache cleared: ${deleted} entries`);
      return deleted;
    }

    for (const key of globalCache.keys()) {
      if (key.includes(pattern)) {
        globalCache.delete(key);
        deleted++;
      }
    }
    
    console.log(`🔄 Cache invalidated: ${deleted} entries matching "${pattern}"`);
    return deleted;
  }, []);

  const getStats = useCallback(() => {
    const stats = { ...cacheStatsRef.current };
    const totalRequests = stats.hits + stats.misses;
    
    return {
      ...stats,
      hitRate: totalRequests > 0 ? (stats.hits / totalRequests) * 100 : 0,
      size: globalCache.size,
      maxSize: finalConfig.maxSize,
    };
  }, [finalConfig.maxSize]);

  const getMemoryUsage = useCallback(() => {
    const entries = Array.from(globalCache.values());
    const totalSize = JSON.stringify(entries).length;
    
    return {
      entriesCount: globalCache.size,
      estimatedSizeBytes: totalSize,
      estimatedSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    };
  }, []);

  return {
    get,
    set,
    invalidate,
    getStats,
    getMemoryUsage,
  };
};
