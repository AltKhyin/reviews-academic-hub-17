
// ABOUTME: API call middleware with proper type safety, error handling, and monitoring
interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

interface ApiCallStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastMinuteCalls: number;
  averageResponseTime: number;
}

class ApiCallMonitor {
  private static instance: ApiCallMonitor;
  private callHistory: Array<{ timestamp: number; success: boolean; duration: number }> = [];
  private stats: ApiCallStats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    lastMinuteCalls: 0,
    averageResponseTime: 0
  };

  static getInstance(): ApiCallMonitor {
    if (!ApiCallMonitor.instance) {
      ApiCallMonitor.instance = new ApiCallMonitor();
    }
    return ApiCallMonitor.instance;
  }

  trackApiCall(endpoint: string, duration: number, success: boolean) {
    const now = Date.now();
    
    // Add to history
    this.callHistory.push({ timestamp: now, success, duration });
    
    // Clean old entries (older than 1 minute)
    this.callHistory = this.callHistory.filter(call => now - call.timestamp < 60000);
    
    // Update stats
    this.stats.totalCalls++;
    if (success) {
      this.stats.successfulCalls++;
    } else {
      this.stats.failedCalls++;
    }
    
    this.stats.lastMinuteCalls = this.callHistory.length;
    this.stats.averageResponseTime = this.callHistory.reduce((sum, call) => sum + call.duration, 0) / this.callHistory.length;
    
    console.log(`API Call: ${endpoint}, Duration: ${duration}ms, Success: ${success}`);
  }

  getTotalCallsInLastMinute(): number {
    const now = Date.now();
    return this.callHistory.filter(call => now - call.timestamp < 60000).length;
  }

  getStats(): ApiCallStats {
    return { ...this.stats };
  }
}

export class ApiCallMiddleware {
  private static rateLimits = new Map<string, { count: number; reset: number }>();
  private static readonly RATE_LIMIT = 100; // requests per minute
  private static readonly RATE_WINDOW = 60 * 1000; // 1 minute in ms

  static async makeApiCall<T = any>(
    endpoint: string,
    options: ApiCallOptions = {}
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const monitor = ApiCallMonitor.getInstance();
    
    try {
      // Rate limiting check
      const rateLimitKey = `api_${endpoint}`;
      const now = Date.now();
      const rateLimit = this.rateLimits.get(rateLimitKey);

      if (rateLimit) {
        if (now < rateLimit.reset) {
          if (rateLimit.count >= this.RATE_LIMIT) {
            monitor.trackApiCall(endpoint, Date.now() - startTime, false);
            return {
              error: 'Rate limit exceeded',
              status: 429,
            };
          }
          rateLimit.count++;
        } else {
          // Reset window
          this.rateLimits.set(rateLimitKey, { count: 1, reset: now + this.RATE_WINDOW });
        }
      } else {
        this.rateLimits.set(rateLimitKey, { count: 1, reset: now + this.RATE_WINDOW });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      const response = await fetch(endpoint, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const duration = Date.now() - startTime;
        monitor.trackApiCall(endpoint, duration, false);
        return {
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const data = await response.json();
      const duration = Date.now() - startTime;
      monitor.trackApiCall(endpoint, duration, true);
      
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      monitor.trackApiCall(endpoint, duration, false);
      console.error('API call error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }
}

// Export the monitor instance for external use
export const apiCallMonitor = {
  trackApiCall: (endpoint: string, duration: number, success: boolean) => {
    ApiCallMonitor.getInstance().trackApiCall(endpoint, duration, success);
  },
  getTotalCallsInLastMinute: () => {
    return ApiCallMonitor.getInstance().getTotalCallsInLastMinute();
  },
  getStats: () => {
    return ApiCallMonitor.getInstance().getStats();
  }
};
