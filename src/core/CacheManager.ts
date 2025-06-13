
// ABOUTME: Unified caching system replacing scattered caching approaches
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  hitCount: number;
  missCount: number;
  size: number;
  hitRate: number;
}

export interface CacheStrategy {
  defaultTTL: number;
  maxSize: number;
  evictionPolicy: 'LRU' | 'LFU' | 'TTL';
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private strategy: CacheStrategy;
  private stats: CacheStats;

  constructor(strategy?: Partial<CacheStrategy>) {
    this.strategy = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      evictionPolicy: 'LRU',
      ...strategy
    };
    
    this.stats = {
      hitCount: 0,
      missCount: 0,
      size: 0,
      hitRate: 0
    };
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.missCount++;
      this.updateHitRate();
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.missCount++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    this.stats.hitCount++;
    this.updateHitRate();
    
    return entry.data;
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    // Ensure cache space
    this.ensureCacheSpace();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.strategy.defaultTTL,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    this.stats.size = this.cache.size;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    return (now - entry.timestamp) > entry.ttl;
  }

  private ensureCacheSpace(): void {
    if (this.cache.size >= this.strategy.maxSize) {
      this.evictEntries();
    }
  }

  private evictEntries(): void {
    const now = Date.now();
    let evictedCount = 0;
    const targetEvictions = Math.ceil(this.strategy.maxSize * 0.1); // Evict 10%

    switch (this.strategy.evictionPolicy) {
      case 'TTL':
        // Remove expired entries first
        for (const [key, entry] of this.cache) {
          if (this.isExpired(entry)) {
            this.cache.delete(key);
            evictedCount++;
            if (evictedCount >= targetEvictions) break;
          }
        }
        break;

      case 'LRU':
        // Remove least recently used
        const lruEntries = Array.from(this.cache.entries())
          .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
        
        for (let i = 0; i < targetEvictions && i < lruEntries.length; i++) {
          this.cache.delete(lruEntries[i][0]);
        }
        break;

      case 'LFU':
        // Remove least frequently used
        const lfuEntries = Array.from(this.cache.entries())
          .sort(([, a], [, b]) => a.accessCount - b.accessCount);
        
        for (let i = 0; i < targetEvictions && i < lfuEntries.length; i++) {
          this.cache.delete(lfuEntries[i][0]);
        }
        break;
    }

    this.stats.size = this.cache.size;
  }

  private updateHitRate(): void {
    const total = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate = total > 0 ? this.stats.hitCount / total : 0;
  }

  getCacheStats(): CacheStats {
    return { ...this.stats };
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hitCount: 0,
      missCount: 0,
      size: 0,
      hitRate: 0
    };
  }

  getSize(): number {
    return this.cache.size;
  }
}
