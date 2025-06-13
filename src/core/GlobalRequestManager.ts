
// ABOUTME: Central request coordination system replacing fragmented API calls
import { RequestDeduplication } from './RequestDeduplication';
import { CacheManager } from './CacheManager';

export interface RequestOperation<T = any> {
  key: string;
  operation: () => Promise<T>;
  priority: 'critical' | 'normal' | 'background';
  cacheTTL?: number;
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  retryCondition?: (error: Error) => boolean;
}

export interface RequestMetrics {
  totalRequests: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  deduplicationSavings: number;
}

class GlobalRequestManager {
  private static instance: GlobalRequestManager;
  private requestRegistry: Map<string, Promise<any>> = new Map();
  private requestMetrics: RequestMetrics;
  private deduplicationLayer: RequestDeduplication;
  private cacheManager: CacheManager;
  private requestCounts: Map<string, number> = new Map();
  private responseTimes: number[] = [];
  private errorCount = 0;
  private startTime = Date.now();

  private constructor() {
    this.deduplicationLayer = new RequestDeduplication();
    this.cacheManager = new CacheManager();
    this.requestMetrics = {
      totalRequests: 0,
      requestsPerSecond: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      deduplicationSavings: 0
    };
  }

  static getInstance(): GlobalRequestManager {
    if (!GlobalRequestManager.instance) {
      GlobalRequestManager.instance = new GlobalRequestManager();
    }
    return GlobalRequestManager.instance;
  }

  async executeRequest<T>(operation: RequestOperation<T>): Promise<T> {
    const startTime = performance.now();
    this.requestMetrics.totalRequests++;

    try {
      // Check cache first
      const cachedResult = await this.cacheManager.get<T>(operation.key);
      if (cachedResult) {
        this.updateCacheHitMetrics();
        return cachedResult;
      }

      // Use deduplication layer
      const result = await this.deduplicationLayer.deduplicateRequest(
        { 
          endpoint: operation.key, 
          parameters: {}, 
          hash: operation.key 
        },
        operation.operation
      );

      // Cache the result
      if (operation.cacheTTL) {
        await this.cacheManager.set(operation.key, result, operation.cacheTTL);
      }

      // Update metrics
      const responseTime = performance.now() - startTime;
      this.responseTimes.push(responseTime);
      this.updateMetrics();

      return result;
    } catch (error) {
      this.errorCount++;
      this.updateMetrics();
      
      // Apply retry policy if specified
      if (operation.retryPolicy) {
        return this.retryRequest(operation, error as Error);
      }
      
      throw error;
    }
  }

  private async retryRequest<T>(operation: RequestOperation<T>, lastError: Error): Promise<T> {
    const { maxRetries, backoffMs, retryCondition } = operation.retryPolicy!;
    
    if (retryCondition && !retryCondition(lastError)) {
      throw lastError;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
        return await operation.operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  private updateCacheHitMetrics(): void {
    // Update cache hit rate calculation
    const cacheHits = this.cacheManager.getCacheStats().hitCount;
    this.requestMetrics.cacheHitRate = cacheHits / this.requestMetrics.totalRequests;
  }

  private updateMetrics(): void {
    const now = Date.now();
    const timeElapsed = (now - this.startTime) / 1000;
    
    this.requestMetrics.requestsPerSecond = this.requestMetrics.totalRequests / timeElapsed;
    this.requestMetrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length || 0;
    this.requestMetrics.errorRate = this.errorCount / this.requestMetrics.totalRequests;
    this.requestMetrics.deduplicationSavings = this.deduplicationLayer.getSavingsCount();
  }

  getRequestMetrics(): RequestMetrics {
    this.updateMetrics();
    return { ...this.requestMetrics };
  }

  getActiveRequestCount(): number {
    return this.requestRegistry.size;
  }

  clearMetrics(): void {
    this.requestMetrics = {
      totalRequests: 0,
      requestsPerSecond: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      deduplicationSavings: 0
    };
    this.responseTimes = [];
    this.errorCount = 0;
    this.startTime = Date.now();
  }
}

export { GlobalRequestManager };
