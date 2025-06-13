
// ABOUTME: Request deduplication system to prevent duplicate API calls
export interface RequestFingerprint {
  endpoint: string;
  parameters: Record<string, any>;
  hash: string;
}

export interface CachedResponse<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class RequestDeduplication {
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private requestCache: Map<string, CachedResponse> = new Map();
  private savingsCount = 0;

  async deduplicateRequest<T>(
    fingerprint: RequestFingerprint,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey(fingerprint);
    
    // Return pending request if exists
    if (this.pendingRequests.has(key)) {
      this.savingsCount++;
      return this.pendingRequests.get(key);
    }

    // Return cached response if valid
    const cached = this.requestCache.get(key);
    if (cached && this.isCacheValid(cached)) {
      this.savingsCount++;
      return cached.data;
    }

    // Execute new request
    const promise = requestFn().then(result => {
      // Cache the result for short-term deduplication
      this.requestCache.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl: 30000 // 30 seconds for deduplication
      });
      return result;
    });

    this.pendingRequests.set(key, promise);

    promise.finally(() => {
      this.pendingRequests.delete(key);
    });

    return promise;
  }

  private generateKey(fingerprint: RequestFingerprint): string {
    if (fingerprint.hash) {
      return fingerprint.hash;
    }
    
    const paramString = JSON.stringify(fingerprint.parameters, Object.keys(fingerprint.parameters).sort());
    return `${fingerprint.endpoint}:${paramString}`;
  }

  private isCacheValid(cached: CachedResponse): boolean {
    const now = Date.now();
    return (now - cached.timestamp) < cached.ttl;
  }

  getSavingsCount(): number {
    return this.savingsCount;
  }

  clearCache(): void {
    this.requestCache.clear();
    this.pendingRequests.clear();
    this.savingsCount = 0;
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }

  getCacheSize(): number {
    return this.requestCache.size;
  }
}
